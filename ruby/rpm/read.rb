
#f = File.new(ARGV[0])

class Field
  attr_reader :name, :length, :format

  def initialize(name, length, format)
    @name = name
    @length = length
    @format = format
  end
end

class Lead
  MAGIC = [0xED, 0xAB, 0xEE, 0xDB].pack("C*").freeze

  module Type
    BINARY = 0
    SOURCE = 1
  end

  FIELDS = [
    Field.new("magic", 4, "a4"),
    Field.new("major", 1, "C"),
    Field.new("minor", 1, "C"),
    Field.new("type", 2, "n"),
    Field.new("archnum", 2, "n"),
    Field.new("name", 66, "Z66"),
    Field.new("osnum", 2, "n"),
    Field.new("signature_type", 2, "n"),
    Field.new("reserved", 16, "Z16"),
  ]
  LENGTH = FIELDS.map(&:length).sum.freeze
  FORMAT = FIELDS.map(&:format).join.freeze

  def self.from_io(io)
    data = io.read(LENGTH)
    if data.nil? || data.length != Lead::LENGTH
      raise "Invalid RPM lead section. Wrong length: #{data.length}, expected: #{Lead::LENGTH}"
    end

    lead = new()
    lead.magic, lead.major, lead.minor, lead.type, lead.archnum, lead.name, lead.osnum, lead.signature_type, lead.reserved = data.unpack(FORMAT)
    return lead
  end

  def initialize
    @magic = MAGIC

    # Default to RPM format 3.0
    @major = 3
    @minor = 0

    @type = Type::BINARY
    @archnum = 0 # NOARCH
    @name = nil
    @osnum = 1 # Linux
    @signature_type = 0 # no signature
    @reserved = "\0" * 16
  end

  attr_accessor :magic, :major, :minor, :type, :archnum, :name, :osnum, :signature_type, :reserved

  def write_to(io)
    data = [@magic, @major, @minor, @type, @archnum, @name, @osnum, @signature_type, @reserved].pack(FORMAT)
    io.write(data)  
  end
end

class Header
  INTRO_LENGTH = 12
  INTRO_FORMAT = "a8NN"

  INDEX_ENTRY_LENGTH = 16
  INDEX_ENTRY_FORMAT = "NNSN"

  class IndexEntry
    attr_reader :tag, :type, :offset, :count

    def initialize(tag, type, offset, count)
      @tag = tag
      @type = type
      @offset = offset
      @count = count
    end

    def self.from_io(io)
      data = io.read(INDEX_ENTRY_LENGTH)
      if data.nil? || data.length != INDEX_ENTRY_LENGTH
        raise "Invalid RPM header index entry. Wrong length: #{data.length}, expected: #{INDEX_ENTRY_LENGTH}"
      end

      tag, type, offset, count = data.unpack(INDEX_ENTRY_FORMAT)
      new(tag, type, offset, count)
    end
  end

  def self.from_io(io)
    intro = io.read(INTRO_LENGTH)
    if intro.nil? || intro.length != INTRO_LENGTH
      raise "Invalid RPM header intro. Wrong length: #{intro.length}, expected: #{INTRO_LENGTH}"
    end

    magic, index_length, data_length = intro.unpack(INTRO_FORMAT)

    puts "Magic: #{magic.unpack1('H*')}, Index Length: #{index_length}, Data Length: #{data_length}"
    index_length.times do |i|
      p IndexEntry.from_io(io)
    end
    # read data
  end
end

if ARGV.empty?
  puts "Usage: ruby read.rb <file_path>"
  exit 1
end

file_path = ARGV[0]
unless File.exist?(file_path)
  puts "File not found: #{file_path}"
  exit 1
end

File.open(file_path, "rb") do |file|
  lead = Lead.from_io(file)
  puts lead.inspect

  #lead.write_to(STDOUT)
  header = Header.from_io(file)
  p header

end