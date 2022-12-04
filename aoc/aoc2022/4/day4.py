#!/usr/bin/env python3

import sys
import re

# range() in python is *exclusive* of the stop value
# In this challenge, the input ranges are *inclusive*, and using python's
# builtin range() makes this a little difficult.
# So, write my own inclusive range class
class InclusiveRange:
    def __init__(self, start, stop):
        self.start = start
        self.stop = stop

    def __str__(self):
        return "{}-{}".format(self.start, self.stop)

    """ 
    Check if one range fully contains another range.

    This method allows python's `in` operator to work.
    InclusiveRange and `int` types are supported.
    """
    def __contains__(self, other):
        if isinstance(other, self.__class__):
            # Is the 'other' range fully inside of our range?
            return self.start >= other.start and self.stop <= other.stop
        elif isinstance(other, int):
            # Is a number in the range?
            return self.start <= other and self.stop >= other
        else:
            raise Exception("Unexpected type: {}".format(type(other)))

input_re = re.compile(r'(\d+)-(\d+),(\d+)-(\d+)')

def parse(input):
    input.rstrip()
    m = input_re.match(input)
    if m:
        elf1 = InclusiveRange(int(m.group(1)), int(m.group(2)))
        elf2 = InclusiveRange(int(m.group(3)), int(m.group(4)))
        return elf1, elf2
    else:
        raise Exception(format("Some bug parsing input? Line was: {}", input))

def full_overlap(one, two):
    return one in two or two in one

def any_overlap(one, two):
    if two.start in one or two.stop in one:
        return True
    if one.start in two or one.stop in two:
        return True
    return False

count_full_overlap = 0
count_any_overlap = 0

for line in [x.rstrip() for x in sys.stdin]:
    elf1, elf2 = parse(line)

    if full_overlap(elf1, elf2):
        count_full_overlap += 1
    if any_overlap(elf1, elf2):
        count_any_overlap += 1

print("Full overlap: {}".format(count_full_overlap))
print("Any overlap: {}".format(count_any_overlap))