import random

class Payment(object):
  def __init__(self, interest, principle):
    self.interest = interest
    self.principle = principle

  def value(self):
    return self.interest + self.principle

  def __repr__(self):
    return repr({ "interest": self.interest, "principle": self.principle })

class Mortgage(object):
  def payments(self):
    current = self.amount

    for self.month in range(0, self.term * 12):
      interest = (current * self.rate) / 12.0
      principle = self.minimum_payment - interest
      yield Payment(interest, principle)
      current -= principle


class Option1Primary(Mortgage):
  rate = 0.0375
  amount = 496000
  minimum_payment = 2297.05
  fees = 0
  term = 30
  fixed = True

class Option1Secondary(Mortgage):
  amount = 56500

  # first 3 years is interest only, but I'll assume interest plus principle.
  minimum_payment = 183.30 + 130.00
  fees = 0
  term = 30
  current_rate = 0.04

  @property
  def rate(self):
    if self.month > (3 * 12) and self.month % 12 == 0:
      # random guess at what the new adjusted rate will be after 3 years
      # rules are Prime rate + 1.75%
      # Current prime rate is 3.25%, so minimum is 5%
      # Allow +2% for fluctuation in the future.
      self.current_rate = 0.05 + (random.random() * 0.02)
    return self.current_rate

class Option2Primary(Mortgage):
  rate = 0.035
  amount = 617000 * 1.0175 # 1.75% UFPMI for FHA loan
  fees = 0
  term = 30
  fixed = True
    
  @property
  def minimum_payment(self):
    if self.month < (5 * 12): # first 5 years requires PMI
      return 2777.72 + 643.22
    else:
      return 2777.72
      

#print "interest1,principle1,interest2,principle2"
#for p1, p2 in zip(Option1Primary().payments(), Option1Secondary().payments()):
  #print "%f,%f,%f,%f" % (p1.interest, p1.principle, p2.interest, p2.principle)

print "interest,principle"
for p in Option2Primary().payments():
  print "%f,%f" % (p.interest, p.principle)

