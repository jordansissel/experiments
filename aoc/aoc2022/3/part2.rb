require_relative "util"

# Groups are 3 elf rucksack contents
class ElfGroups
  include Enumerable

  def each
    while !ARGF.eof?
      yield 3.times.collect { ARGF.readline.chomp }
    end
  end
end

group = ElfGroups.new.map do |elves|
  # Find the item in common?
  priority(common(common(elves.first.chars, elves[1]), common(elves.first.chars, elves[2])).first)
end
p group.sum
