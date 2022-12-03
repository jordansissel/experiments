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

def common(a, b)
  a.select { |i| b.include?(i) }.uniq
end
