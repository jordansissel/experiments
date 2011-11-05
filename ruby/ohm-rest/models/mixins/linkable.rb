require "./models/link"

module Linkable
  def self.included(model)
    model.set :links, Link
    #model.index :links
    # TODO(sissel): Make a way to register to_hash
  end # def self.included
end # module Linkable
