require "rubygems/package" # for Gem::Package::TarReader

# IOFaker can be included into an IO object to trick Gem::Package::TarReader into being able to read it.
# TarReader expects to be able to call IO#seek and IO#rewind, but streams can't do this, so, we lie.
module IOFaker
  def pos
    return @pos ||= 0
  end

  def seek(count, flag)
    if flag == IO::SEEK_CUR && count >= 0
      # Fake a CUR seek by just reading data.
      read(count)
      #p :seek => count
      @pos += count
    else
      raise Errno::ESPIPE
    end
  end

  def read(*args)
    data = super(*args)
    @pos += data.length
    return data
  end
end # IOFaker

class LibraryArchive
  class LibraryArchiveError < StandardError; end

  class InvalidMagic < LibraryArchiveError; end
  class InvalidHeader < LibraryArchiveError; end
  class InvalidPayloadPadding < LibraryArchiveError; end

  class Header
    attr_reader :name, :mtime, :uid, :gid, :mode, :size, :trailer

    HEADER = {
      :name => 16,
      :mtime => 12,
      :uid => 6,
      :gid => 6,
      :mode => 8,
      :size => 10,
      :trailer => 2,
    }

    HEADER_LEN = HEADER.values.sum

    def initialize(name, mtime, uid, gid, mode, size, trailer)
      @name = name
      @mtime = mtime.to_i
      @uid = uid.to_i
      @gid = gid.to_i
      @mode = mode.to_i(8) # mode is octal
      @size = size.to_i
      @trailer = trailer
    end

    def validate
      if @trailer != "`\n"
        raise InvalidHeader, "Invalid header trailer: expected '`\\n', got #{@trailer.inspect}"
      end
    end

    def to_s
      "Header(name: #{@name}, mtime: #{@mtime}, uid: #{@uid}, gid: #{@gid}, mode: #{@mode}, size: #{@size}, trailer: #{@trailer.inspect})"
    end

    # Reads a Library Archive (ar) header from the given IO.
    # It returns a Header object or nil if EOF is reached.
    #
    # It raises EOFError if the header is incomplete.
    #
    # Example usage:
    #   header = LibraryArchive::Header.read_from(io)
    def self.read_from(io)
      packstr = HEADER.values.map { |v| "A#{v}" }.join
      data = io.read(HEADER_LEN)
      if data.nil?
        return nil # EOF
      end
      if data.length < HEADER_LEN
        raise EOFError, "Unexpected end of file while reading archive header or read less header than expected."
      end
      header = self.new(*data.unpack(packstr))
      header.validate

      if header.name.start_with?("#1/")
        # If the name starts with "#1/", it indicates that the name is longer than
        # 16 characters and is followed by the length of the name. The spec
        # calls this an "overflow name". 
        # An example entry is "#1/20" which means the name is 20 characters long.
        name_len = header.name[3..].to_i
        name_data = io.read(name_len)
        if name_data.nil? || name_data.length < name_len
          raise EOFError, "Unexpected end of file while reading archive header name"
        end
        header.name = name_data.unpack("A*").first # Can be null padded?
        header.size -= name_len # Reduce payload size to account for the overflow name length
      end

      return header
    end
  end # Header

  attr_reader :io

  MAGIC = "!<arch>\n"

  # Prepare to process the given IO as a library archive (ar) file.
  # This method will immediately try to validate the file format by checking the
  # file's magic string.
  #
  # Raises InvalidMagic if the magic string is not as expected.
  def initialize(io)
    @io = io
    @was_odd = false;

    read_magic
  end

  # Read the next header from the archive.
  # Returns a Header object or nil if EOF is reached.
  # 
  # It raises InvalidPayloadPadding if there is a padding problem with the payload.
  def next
    # If the previous payload was odd, then it is padded with a single newline that isn't part of the actual entry payload.
    # So we need to consume it before trying to read the next header.
    # 
    # spec> Objects in the archive are always an even number of bytes long; files which are an odd
    # spec> number of bytes long are padded with a newline (``\n'') character,
    # spec> although the size in the header does not reflect this.
    if @payload_was_odd
      pad = @io.read(1)
      if pad != "\n"
        raise InvalidPayloadPadding, "Got unexpected payload padding #{pad.inspect} (payload length is an odd number and must end in a newline character)"
        exit 1
      end
    end

    header = Header.read_from(@io)
    @payload_was_odd = header.size.odd? if header
    return header
  end # next

  public
  # Iterate over the archive's entry. Yields [header, io] for each entry.
  # You *must* read the payload from the io object.
  #
  # The payload length is available as header.size.
  def each(&block)
    while header = self.next
      yield header, @io
    end
  end

  private
  # Read the magic string from the archive.
  # It raises InvalidMagic if the magic string is not as expected.
  def read_magic
    # spec> A file created with ar begins with the ``magic'' string "!<arch>\n".
    magic = @io.read(8)
    if magic != MAGIC
      raise InvalidMagic, "Invalid magic string, expected #{MAGIC.inspect}, got #{magic.inspect}"
    end
  end # read_magic

end # LibraryArchive

# PipeProcessor is a utility class to run a command in a subprocess to process data from an IO stream.
# It handles piping data into the command and reading the output.
# It also provides error handling for command not found and command failure.
#
# Example usage:
#   processor = PipeProcessor.new(["gzip", "-dc"])
#   out_io = processor.start(File.new("file.tar.gz"))
#   # Read from out_io as needed
#   processor.wait()
class PipeProcessor
  class CommandNotFound < StandardError; end
  class CommandFailed < StandardError; end

  def initialize(command)
    if !command.is_a?(Array) || command.any? { |c| !c.is_a?(String) }
      raise ArgumentError, "Command must be a Array of Strings, got #{command.inspect}"
    end 

    @command = command
  end

  # Start the subprocess. You are responsibile for calling `wait` when you are done reading.
  # 
  # It takes an IO object to read data from and an optional length to limit the amount of data written.
  # It returns an IO object that can be read to get the output of the command.
  def start(io, length = nil)
    in_reader, in_writer = IO.pipe
    out_reader, out_writer = IO.pipe

    begin
      @pid = Process.spawn(*@command, :in => in_reader, :err => STDERR, :out => out_writer, :close_others => true)
    rescue Errno::ENOENT => e
      in_reader.close
      out_writer.close
      raise
    end

    @tid = Thread.new { copy_stream(io, in_writer, length) }
    return out_reader
  ensure
    in_reader.close
    out_writer.close
  end

  # Wait for the subprocess to finish and handle any errors.
  # It raises CommandFailed if the command exits with a non-zero status.
  # It also handles EPIPE errors that can occur if the command fails to read from the pipe.
  #
  # You must call this after you are done reading from the output IO returned by `start`.
  def wait
    status = Process.wait(@pid)
    if !$?.success?
      raise CommandFailed, "Command '#{@command.join(" ")}' failed with status #{$?.exitstatus}"
    end

    begin
      @tid.join
    rescue Errno::EPIPE => e
      raise CommandFailed, "Command '#{@command.join(" ")}' failed with EPIPE error: #{e.message}"
    end
  end

  private
  # Copy data from the input IO to the output IO.
  # It raises an error if the number of bytes written does not match the expected length.
  #
  # If length is nil, it will copy all data until EOF.
  # If length is specified, it will copy exactly that many bytes and raise an error if it doesn't.
  #
  # Note: This method does not close the input IO, as it is not the responsibility of this class.
  def copy_stream(input, output, length=nil)
    # Pipe the input into the subprocess
    wrote = IO.copy_stream(input, output, length)
    if !length.nil? && wrote != length
      raise "PipeProcessor: Terminated early before completing write. Wrote #{wrote} bytes, needed to write #{length} bytes"
    end
  ensure
    output.close unless output.closed?

    # Note: We don't close input here because it is not our responsibility.
  end
end

class DebianPackage
  class Error < StandardError; end
  class InvalidPackage < Error; end
  class ProcessFailed < Error; end
  class UnsupportedCompression < Error; end

  # Process a Debian package archive from the given IO object.
  # The block is called for each tar entry in the package.
  # The block receives the tar name and a Gem::Package::TarReader object.
  #
  # Example:
  #   DebianPackage.process(File.new("package.deb")) do |name, tar|
  #     puts "Processing: #{name}"
  #     tar.each do |entry|
  #       puts "tar entry> #{[entry.header.prefix, entry.header.name].join}"
  #     end
  #   end
  def self.process(io, &block)
    raise ArgumentError, "A block must be provided" if block.nil?

    # XXX: Should we require the archive entries be in a specific order, like "debian-binary" first?
    LibraryArchive.new(io).each do |header, io|
      p header.name
      if header.name == "debian-binary"
        if header.size != 4
          raise InvalidPackage, "Invalid 'debian-binary' size: #{header.size}, expected 4"
        end

        # The 'debian-binary' file contains the version of the Debian package format.
        # It should be "2.0\n" for Debian packages.
        version = io.read(4)

        if version != "2.0\n"
          raise InvalidPackage, "Unsupported debian package format: #{version.inspect}"
        end
      elsif header.name.start_with?("control.tar") || header.name.start_with?("data.tar")
        self.extract_tar(header, io, &block)
      else
        raise "Unknown deb entry: #{header.name}"
      end
    end # LibraryArchive#each
  end # process

  private

  DECOMPRESSORS = {
    "zst" => ["zstd", "-dc"],
    "gz" => ["gzip", "-dc"],
    "bz2" => ["bzip2", "-dc"],
    "xz" => ["xz", "-dc"],
  }

  def self.extract_tar(header, io, &block)
    compression = header.name.split(".")[-1]
    command = DECOMPRESSORS[compression]

    if command.nil?
      raise UnsupportedCompression, "Unsupported compression format on file #{header.name}: #{compression}"
    end

    processor = PipeProcessor.new(command)
    begin
      pipe_io = processor.start(io, header.size)
    rescue Errno::ENOENT => e
      raise ProcessFailed, "Command '#{command.first}' not found and is needed to decompress '#{header.name}' in the archive. Ensure it is installed and in your PATH. Error: #{e.message}"
    end

    # Trick Gem::Package::TarReader into being able to process a pipe/stream.
    class << pipe_io
      include IOFaker
    end

    # This is kind of a race condition, but if the pipe is already at EOF before
    # we read it, it means decompression process failed.
    if pipe_io.eof?
      raise ProcessFailed, "Tar file is unexpectedly empty or the decompression failed inside '#{io.path}'. The problem tar is '#{header.name}'. Is '#{command.first}' available in your PATH?"
    end
    tar = Gem::Package::TarReader.new(pipe_io)
    block.call(header.name, tar)
    processor.wait()
  end # extract_tar
end # DebianPackage

begin
  deb = DebianPackage::process(File.new(ARGV[0])) do |name, tar|
    puts "Processing: #{name}"
    tar.each do |entry|
      filename = [entry.header.prefix, entry.header.name].join
      puts "tar entry> #{filename}"

      # Example showing how to read the contents of a tar entry:
      if filename == "./control"
        puts "--- control file "
        puts entry.read
        puts "--- control file "
      end
    end
  end
rescue DebianPackage::Error => e
  puts "Invalid package: #{e.message}"
end