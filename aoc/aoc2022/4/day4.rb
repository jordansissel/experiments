#/usr/bin/env ruby

class Reader
    include Enumerable

    def each
        while !ARGF.eof?
            yield ARGF.readline.chomp
        end
    end
end

full_overlap = 0
any_overlap = 0
Reader.new.each do |line|
    # Parse with the format with a regex.
    # Uses capture groups in order to pick each number out of the line.
    m = line.match(/(\d+)-(\d+),(\d+)-(\d+)/)
    raise "Bug?" unless m

    # Turn each text range "1-3" into a Range object 1..3
    elf1, elf2 = Range.new(*m[1..2].map(&:to_i)), Range.new(*m[3..4].map(&:to_i))

    full_overlap += 1 if elf1.cover?(elf2) || elf2.cover?(elf1)

    if elf1.cover?(elf2.min) || elf1.cover?(elf2.max) \
        || elf2.cover?(elf1.min) || elf2.cover?(elf1.max)
        any_overlap += 1
    end
end

puts "Full overlap: #{full_overlap}"
puts "Any overlap: #{any_overlap}"
