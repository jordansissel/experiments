require "rubygems/package" # for Gem::Package::TarReader
require "fcntl"

# IOFaker can be included into an IO object to trick Gem::Package::TarReader into being able to read it.
# TarReader expects to be able to call IO#seek and IO#rewind, but streams can't do this.
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
        # 16 characters and is followed by the length of the name.
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

  # The AR file format has three states:
  # - magic: reading the magic string
  # - header: reading the header
  # - payload: reading the file payload
  # The state machine is used to read the archive in a structured way.
  def initialize(io)
    @io = io
    @was_odd = false;

    read_magic
  end

  def read_magic
    # spec> A file created with ar begins with the ``magic'' string "!<arch>\n".
    magic = @io.read(8)
    if magic != "!<arch>\n"
      raise InvalidMagic, "Invalid magic string, expected '!<arch>\\n', got #{magic.inspect}"
    end
  end # read_magic

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
    if header
      @payload_was_odd = header.size.odd?
    end
    return header
  end # next

  # Iterate over the archive's entry. Yields [header, io] for each entry.
  # You *must* read the payload from the io object.
  #
  # The payload length is available as header.size.
  def each(&block)
    while header = self.next
      yield header, @io
    end
  end
end # LibraryArchive

class PipeProcessor
  def initialize(command)
    @command = command

    if !@command.is_a?(Array) || @command.any? { |c| !c.is_a?(String) }
      raise ArgumentError, "Command must be a Array of Strings, got #{@command.inspect}"
    end 
  end

  def start(io, length = nil)
    in_reader, in_writer = IO.pipe
    out_reader, out_writer = IO.pipe

    #@pid = Process.spawn("zstd", "-d", "--stdout", :in => in_reader, :err => STDERR, :out => out_writer, :close_others => true)
    @pid = Process.spawn(*@command, :in => in_reader, :err => STDERR, :out => out_writer, :close_others => true)
    in_reader.close
    out_writer.close
    @tid = Thread.new { copy_stream(io, in_writer, length) }
    return out_reader
  end

  def wait
    Process.wait(@pid)
    @tid.join
  end

  private
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
  def self.process(io, &block)
    raise ArgumentError, "A block must be provided" if block.nil?

    LibraryArchive.new(io).each do |header, io|
      if header.name == "debian-binary"
        version = io.read(header.size)
        if version != "2.0\n"
          puts "Unsupported debian package format: #{version.inspect}"
          exit 1
        end
      elsif header.name.start_with?("control.tar") || header.name.start_with?("data.tar")
        self.extract_tar(header, io, &block)
      else
        raise "Unknown deb entry: #{header.name}"
      end
    end
  end # process

  private

  DECOMPRESSORS = {
    "zst" => ["zstd", "-d", "--stdout"],
  }

  def self.extract_tar(header, io, &block)
    compression = header.name.split(".")[-1]
    command = DECOMPRESSORS[compression]

    if command.nil?
      raise "Unsupported compression format on file #{header.name}: #{compression}"
    end

    processor = PipeProcessor.new(command)
    pipe_io = processor.start(io, header.size)

    # Trick Gem::Package::TarReader into being able to process a pipe/stream.
    class << pipe_io
      include IOFaker
    end

    tar = Gem::Package::TarReader.new(pipe_io)
    block.call(header.name, tar)
    processor.wait()
  end
end

#filter = PipeProcessor.new(["sort"])
#io = filter.start(STDIN)

#puts "--- start"
#puts io.read
#puts "--- done"
#
#filter.wait()
#
#exit 0

deb = DebianPackage::process(File.new(ARGV[0])) do |name, tar|
  puts "Processing: #{name}"
  tar.each do |entry|
    puts "tar entry> #{[entry.header.prefix, entry.header.name].join}"
  end
end

exit 0

ar = LibraryArchive.new(File.new(ARGV[0]))

ar.each do |header, io|
  puts "AR Header: #{header}"
  if header.name == "debian-binary"
    p io.read(header.size)
  else
    io.seek(header.size, IO::SEEK_CUR) # Skip the payload
  end
  #io.read(header.size)
end
exit 0

while true
  header = {}
  puts "Reading AR header at position #{ar.pos}"
  data = ar.read(HEADER_LEN)

  if data == nil
    # eof
    break
  end

  puts "AR Header text: #{data.inspect}"
  data.unpack(packstr).each_with_index do |value, key|
    header[HEADER.keys[key]] = value
  end

  if header[:trailer] != "`\n"
    puts "Found invalid header trailer: #{data.inspect}"
    exit 1
  end

  header[:mtime] = header[:mtime].to_i
  header[:uid] = header[:uid].to_i
  header[:gid] = header[:gid].to_i
  header[:mode] = header[:mode].to_i(8) # mode is octal
  header[:size] = header[:size].to_i

  # > If any file name is more than 16 characters in length or contains an
  # > embedded space, the string "#1/" followed by the ASCII length of the name
  # > is written in the name field.  The file size (stored in the archive header)
  # > is incremented by the length of the name.  The name is then written
  # > immediately following the archive header.
  if header[:name].start_with?("#1/")
    name_len = header[:name][3..].to_i
    header[:name] = ar.read(name_len).unpack("A*") # Can be null padded?
    header[:size] -= name_len
  end

  puts "AR Header: #{header.inspect}"

  if header[:name].start_with?("control.tar") || header[:name].start_with?("data.tar")
    compression = header[:name].split(".")[-1]
    case compression
    #when "zst"
      #ar.seek(header[:size], IO::SEEK_CUR)
    #when "zst-"
    when "zst"
      arin, arout = IO.pipe
      pin, pout = IO.pipe

      pid = Process.spawn("zstd", "-d", "--stdout", :in => arin, :err => STDERR, :out => pout, :close_others => true)
      arin.close
      pout.close
      #fd.close

      #puts "AR Pos before passing to zstd: #{ar.pos}"
      # Pipe the payload into the compressor on a separate thread so that we can
      # read the tar output as fast as it's available.
      piper = Thread.new do
        bytes = header[:size]
        chunksize = 16384
        while bytes > 0
          chunk = (bytes > chunksize) ? chunksize : bytes
          arout.syswrite(ar.sysread(chunk))
          bytes -= chunk
        end
        arout.close()
      end

      #puts "AR Pos after passing to zstd: #{ar.pos}"
      
      # Trick Gem::Package::TarReader into being able to process a pipe/stream.
      class << pin
        include IOFaker
      end

      tar = Gem::Package::TarReader.new(pin)
      tar.each do |entry|
        puts "tar entry> #{[entry.header.prefix, entry.header.name].join}"
      end
      Process.wait(pid)
      piper.join
    else
      puts "Unsupported compression on #{header[:name]}: #{compression}"
      exit 1
    end
  else 
    puts "Skipping payload for file: #{header[:name]}"
    #payload = ar.read(header[:size])
    ar.seek(header[:size], IO::SEEK_CUR)
  end

  # Seek ahead to skip the file payload
  #ar.seek(header[:size], IO::SEEK_CUR)

  # > Objects in the archive are always an even number of bytes long; files which are an odd
  # > number of bytes long are padded with a newline (``\n'') character,
  # > although the size in the header does not reflect this.
  if header[:size].odd?
    pad = ar.read(1)
    if pad != "\n"
      puts "Got unexpected payload padding #{pad.inspect} (payload length is an odd number and must end in a newline character"
      exit 1
    end
  end
end

