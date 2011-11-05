module Nameable
  def self.included(model)
    #p self.name => model.name
    model.attribute :name
    model.index :name
    # TODO(sissel): make a way to register a validation
  end # def self.included
end # module Nameable

