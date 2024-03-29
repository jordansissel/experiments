
# Part 1
## Solution 0, using awk + pipes.
cat input | awk '/^$/ { print sum; sum = 0 } !/^$/ { sum += $1 } END { print sum }' | sort -n |tail -1

## Solution 1, using only awk.
cat input | awk '/^$/ && max < sum { max = sum } /^$/ { sum = 0 } !/^$/ { sum += $1 } END { print max }'

## Solution 2, use awk to split files by elf
cat input | awk '/^$/ { a += 1 } !/^$/ { print > "elf."a }'; ls elf.* | xargs -n1 awk '{ sum += $1 } END {print sum}' | sort -n | tail -1

## Solution 3, only use awk. Uses arrays inside awk.
cat input | awk '/^$/ { a += 1 } !/^$/ { elf[a] += $1 } END { m = elf[0]; for (e in elf) { if (m < elf[e]) { m = elf[e] } }; print m }'

## Solution 4, generate ruby with sed.
cat input | sed -rne '/^$/!{ H }; /^$/ { x; s/(.)\n/\1+/g; s/^\n/puts /; p }' | ruby | sort -n | tail -1

## Solution 5, awk w/ a record separator of two newlines
cat input | awk 'BEGIN { RS="\n\n" } NF > 0 { a = 0; for (i = 1; i <= NF; i++) { a += $i }; print a }' |sort -n |tail -1
#
# Part 2
# Solution 0, using awk|sort|tail
cat input | awk '/^$/ { print sum; sum = 0 } !/^$/ { sum += $1 } END { print sum }' | sort -n |tail -3 | awk '{sum += $1} END { print sum }'

# Solution 1, split files w/ awk, then sum top 3
cat input | awk '/^$/ { a += 1 } !/^$/ { print > "elf."a }'; ls elf.* | xargs -n1 awk '{ sum += $1 } END {print sum}' | sort -n | tail -3 | awk '{sum += $1} END { print sum }'
