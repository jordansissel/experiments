require_relative "util"

priorities = []
ARGF.each_line do |line|
  line.chomp!
  compartments = [line[0...line.length()/2], line[line.length()/2..-1]] \
    .map(&:chars).map(&:uniq)

  priorities << priority(common(*compartments).first)
end

puts "Priority total: #{priorities.sum}"
