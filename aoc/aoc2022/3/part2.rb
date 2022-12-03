require_relative "util" # Provides priority() and common()

# Groups are 3 elf rucksack contents
# For fun, let's make an Enumerable that yields groups of 3 lines.
# This makes it compatible with other collection functions like map and sum.
class ElfGroups
  include Enumerable

  def each
    while !ARGF.eof?
      yield 3.times.collect { ARGF.readline.chomp }
    end
  end
end

group = ElfGroups.new.collect do |elves|
  # Find the item in common?
  common(
    common(elves.first.chars, elves[1]),
    common(elves.first.chars, elves[2])
  ).first
end.collect(&method(:priority))
p group.sum
