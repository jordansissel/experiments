#!/usr/bin/ruby
#
# Example of using binary search on a text file sorted by the 2nd field in the
# file with format:
# value1 key1
# value2 key2
# etc...

input = ARGV[0]
query = ARGV[1]
size = File.stat(input).size

pivot = (size / 2).floor
cut = pivot;

File.open(input) do |f|
  while (cut > 0)
    f.seek(pivot, IO::SEEK_SET);
    while (f.read(1) != "\n") do end

    # assume data is stored as 'value key'
    value, key = f.readline().split()
    cmp = (query <=> key)
    if (cmp == 0); puts value; exit; end
    cut /= 2
    pivot += (cut.floor * cmp)
  end
end
