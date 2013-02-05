import random
import matplotlib.pyplot as plt

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
      print self.current_rate
    return self.current_rate


fig = plt.figure()

o = Option1Secondary()
for p in o.payments():
  print repr(p)
