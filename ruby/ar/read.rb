require "rubygems/package" # for Gem::Package::TarReader
require "fcntl"

ar = File.new(ARGV[0])

# > A file created with ar begins with the ``magic'' string "!<arch>\n".
magic = ar.read(8)
if magic != "!<arch>\n"
  puts "File does not appear to be an archive file"
  exit 1
end

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
packstr = HEADER.values.map { |v| "A#{v}" }.join

while true
  header = {}
  data = ar.read(HEADER_LEN)

  if data == nil
    # eof
    break
  end

  data.unpack(packstr).each_with_index do |value, key|
    header[HEADER.keys[key]] = value
  end

  if header[:trailer] != "`\n"
    puts "Found invalid header trailer"
    p data
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

  p header

  if header[:name].start_with?("control.tar")
    compression = header[:name].split(".")[-1]
    p compression
    case compression
    when "zst"
      #fd = ar.dup
      #fd = IO.open(ar.fcntl(Fcntl::F_DUPFD))

      arin, arout = IO.pipe

      pin, pout = IO.pipe

      # TODO(sissel): Pipe exactly header[:size] bytes 
      #pid = Process.spawn("zstd", "-d", "--stdout", :in => fd, :err => STDERR, :out => pout)
      pid = Process.spawn("zstd", "-d", "--stdout", :in => arin, :err => STDERR, :out => pout)
      arin.close
      pout.close
      #fd.close

      p ar.pos
      bytes = header[:size]
      while bytes > 0
        chunk = (bytes > 4096) ? 4096 : bytes
        arout.write(ar.read(chunk))
        bytes -= chunk
      end
      p ar.pos
      p header[:size], ar.pos - header[:size]
      arout.close()
      
      # Trick Gem::Package::TarReader into being able to process a pipe/stream.
      class << pin
        def pos
          return @pos ||= 0
        end

        def seek(count, flag)
          if flag == IO::SEEK_CUR
            # Fake a CUR seek by just reading data.
            read(count)
            p :seek => count
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
      end

      tar = Gem::Package::TarReader.new(pin)
      tar.each do |entry|
        puts "> #{[entry.header.prefix, entry.header.name].join}"
      end
      Process.wait(pid)
      p 
    else
      puts "Unsupported compression on #{header[:name]}: #{compression}"
      exit 1
    end
  end
  #payload = ar.read(header[:size])

  # Seek ahead to skip the file payload
  ar.seek(header[:size], IO::SEEK_CUR)

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

