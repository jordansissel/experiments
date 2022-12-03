
def priority(i)
  case i
  when /[[:upper:]]/
    (i.ord - "A".ord) + 27
  when /[[:lower:]]/
    (i.ord - "a".ord) + 1
  else
    raise "Unexpected item: #{i}"
  end
end

priorities = []
ARGF.each_line do |line|
  line.chomp!
  compartments = [line[0...line.length()/2], line[line.length()/2..-1]] \
    .map(&:chars).map(&:uniq)

  # Priorities
  common = compartments.first.select { |i| compartments.last.include?(i) }
  priorities << common.map(&method(:priority)).sum
end

puts "Priority total: #{priorities.sum}"
