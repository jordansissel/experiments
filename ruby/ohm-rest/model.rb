
# Subclass Ohm::Model so we can hook inheritance to track subclasses to iterate
# over them later.
class Model < Ohm::Model
  class << self
    def inherited(subclass)
      @subclasses ||= []
      @subclasses << subclass
    end # def inherited

    def subclasses
      return @subclasses
    end # def subclass
  end # class << self
end # class Model

