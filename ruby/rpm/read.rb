require_relative "tags"

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
  # Intro structure, network byte order:
  #  unsigned char magic[8];
  #  uint32_t index_length;
  #  uint32_t data_length;
  INTRO_LENGTH = 16
  INTRO_FORMAT = "a8NN"
  INTRO_MAGIC = [ 0x8e, 0xad, 0xe8, 0x01, 0x00, 0x00, 0x00, 0x00 ].pack("C*").freeze

  def initialize
    @tags = []
  end

  def add_tag(entry, value)
    @tags << [entry, value]
  end

  attr_reader :tags

  def inspect
    "#<#{self.class.name} tag count: #{@tags.size}, tags: #{@tags.map { |e| e[0].tag }}>"
  end

  class IndexEntry
    # Index entry structure, network byte order:
    #  uint32_t tag;
    #  uint32_t type;
    #  int32_t offset;
    #  uint32_t count;
    INDEX_ENTRY_LENGTH = 16
    INDEX_ENTRY_FORMAT = "NNl>N"

    attr_reader :tag, :type, :offset, :count

    # Make a hash of tag names to numbers
    module Tag
      TAGS = Hash[RPM_Tags.constants.map { |v| [v, RPM_Tags.const_get(v)] }]
      TAGS.merge!(TAGS.invert)
      TAGS.freeze

      def self.lookup(tag)
        TAGS.fetch(tag) do |key|
          if key.is_a?(Symbol)
            raise KeyError, "Unknown RPM tag name: #{key}"
          elsif key.is_a?(Numeric)
            #raise KeyError, "Unknown RPM tag number: #{key}"
            "UNKNOWN_TAG_#{key}".to_sym
          else
            raise TypeError, "Invalid tag type, must be a Symbol or Numeric: #{key.class}"
          end
        end
      end # def lookup
    end # module Tag

    module Type
      # See 'rpmTagType' enum in rpmtag.h
      TYPES = {
        0 => :null,
        1 => :char,
        2 => :int8,
        3 => :int16,
        4 => :int32,
        5 => :int64,
        6 => :string,
        7 => :binary,
        8 => :string_array,
        9 => :i18nstring,
      }

      # Also store mapping from name -> number
      TYPES.merge!(TYPES.invert)
      TYPES.freeze

      def self.lookup(tag)
        TYPES.fetch(tag) do |key|
          if key.is_a?(Symbol)
            raise KeyError, "Unknown RPM tag type name: #{key}"
          elsif key.is_a?(Numeric)
            raise KeyError, "Unknown RPM tag type number: #{key}"
          else
            raise TypeError, "Invalid tag type, must be a Symbol or Numeric: #{key.class}"
          end
        end
      end # def lookup
    end # module Type

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
      new(Tag.lookup(tag), Type.lookup(type), offset, count)
    end
  end # class IndexEntry

  def self.from_io(io, signature: false)
    puts "Reading next header starting at position #{io.pos}"
    intro = io.read(INTRO_LENGTH)
    if intro.nil? || intro.length != INTRO_LENGTH
      raise "Invalid RPM header intro. Wrong length: #{intro.length}, expected: #{INTRO_LENGTH}"
    end

    # Read the rpm header intro.
    magic, index_length, data_length = intro.unpack(INTRO_FORMAT)

    if magic != INTRO_MAGIC
      raise "Invalid RPM header intro magic: #{magic.unpack1('H*')}, expected: #{INTRO_MAGIC.unpack1('H*')}"
    end

    #puts "Magic: #{magic.unpack1('H*')}, Index Length: #{index_length}, Data Length: #{data_length}"
    index = index_length.times.collect do
      IndexEntry.from_io(io)
    end

    if data_length > 100 << 10 # 100 KiB
      raise "Very large RPM header data length: #{data_length} bytes, refusing to read"
    end

    data = io.read(data_length)

    if data.nil? || data.length != data_length
      raise "Invalid RPM header data. Wrong length: #{data.length}, expected: #{data_length}"
    end

    header = self.new

    index.each do |entry|
      value = nil
      case entry.type
      when :string, :i18nstring
        # Strings are null-terminated.
        value = data[entry.offset ..].unpack1("Z*")
        #puts "String tag #{entry.tag} at offset #{entry.offset}: [#{value.length}] #{value.inspect}"
      when :string_array
        value = data[entry.offset ..].unpack("Z*" * entry.count)
      when :binary
        value = data[entry.offset, entry.count]
        #puts "Binary tag #{entry.tag} at offset #{entry.offset}: [#{entry.count}] #{value.inspect}"
      when :char
        value = data[entry.offset].unpack1("C")
        #puts "Char tag #{entry.tag} at offset #{entry.offset}: #{value.inspect}"
      when :int8
        value = data[entry.offset].unpack1("c")
        #puts "Int8 tag #{entry.tag} at offset #{entry.offset}: #{value.inspect}"
      when :int16
        value = data[entry.offset, 2].unpack1("n")
        #puts "Int16 tag #{entry.tag} at offset #{entry.offset}: #{value.inspect}"
      when :int32
        value = data[entry.offset, 4].unpack1("L>")
        #puts "Int32 tag #{entry.tag} at offset #{entry.offset}: #{value.inspect}"
      when :int64
        value = data[entry.offset, 8].unpack1("Q>")
        #puts "Int64 tag #{entry.tag} at offset #{entry.offset}: #{value.inspect}"
      else
        puts "Unknown tag type #{entry.type} for tag #{entry.tag} at offset #{entry.offset} with count #{entry.count}"
      end

      header.add_tag(entry, value)
    end

    # If this header is a Signature, then the length should be rounded up
    # to the nearest multiple of 8.
    # rpm docs> The Signature uses the same underlying data structure as the Header,
    #           but is zero-padded to a multiple of 8 bytes.
    if signature
      # Signature headers are zero-padded to a multiple of 8 bytes.
      padding_length = 8 - (data_length % 8)
      puts "Skipping #{padding_length} bytes of padding for end of signature header"
      io.read(padding_length)
    end

    return header
  end # def from_io
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

  signature = if lead.signature_type == 5
    Header.from_io(file, signature: true)
  else
    nil
  end

  header = Header.from_io(file)
  puts "----"
  p signature
  p header
  puts "Name: " + header.tags.find { |tag, value| tag.tag == :NAME }[1]

  puts "Files"
  #puts header.tags.map(&:first).map(&:tag).sort
  puts header.tags.map(&:first).select { |tag| tag.type == :string_array }.map(&:tag)
  
  dirnames = header.tags.find { |tag, value| tag.tag == :DIRNAMES }.last
  basenames = header.tags.find { |tag, value| tag.tag == :BASENAMES }.last
  dirnames.zip(basenames).each do |dirname, basename|
    puts File.join(dirname, basename)
  end

end