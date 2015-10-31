
module Randomized

  # Randomized text:
  # * length (or length range)
  # * text (valid characters)
  def self.text(length)
    if length.is_a?(Range)
      raise ArgumentError, "Requires ascending range, you gave #{length}." if length.end < length.begin
      raise ArgumentError, "A negative length is not permitted, I received range #{length}" if length.begin < 0

      length = self.number(length)
    else
      raise ArgumentError, "A negative length is not permitted, I received #{length}" if length < 0
    end

    length.times.collect { character }.join
  end

  def self.character
    # TODO(sissel): Generate valid UTF-8. I started reading Unicode 7
    # (http://www.unicode.org/versions/Unicode7.0.0/) and after much reading, I
    # realized I wasn't in my house anymore but had somehow lost track of time
    # and was alone in a field. Civilization had fallen centuries ago.  :P
    
    # Until UTF-8, just return a random lower ASCII character
    number(32..127).chr
  end

  def self.number(range)
    rand(range)
  end

  def self.iterations(range, &block)
    number(range).times(&block)
  end
end
