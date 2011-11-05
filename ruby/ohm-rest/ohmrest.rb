#!/usr/bin/env ruby
#

require "rubygems"
require "ohm"
require "sinatra"
require "json"

# Subclass Ohm::Model so we can hook inheritance to track subclasses
# to iterate over them later.
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

class Link < Model
  attribute :model
  attribute :object_id

  def validate
    assert_present :model
    assert_present :object_id
  end # def validate

  def to_hash
    super.merge(:model => model, :object_id => object_id)
  end # def to_hash
end # class Link

module Linkable
  def self.included(model)
    model.set :links, Link
    #model.index :links
    # TODO(sissel): Make a way to register to_hash
  end # def self.included
end # module Linkable

module Nameable
  def self.included(model)
    #p self.name => model.name
    model.attribute :name
    model.index :name
    # TODO(sissel): make a way to register a validation
  end # def self.included
end # module Nameable

class Deployment < Model
  include Linkable
end  # class Deployment

class Role < Model
end # class Role

class Host < Model
  include Linkable

  attribute :state

  def validate
    p "Validate #{self}"
    assert_present :state
  end # def validate

  def to_hash
    super.merge(:state => state, :links => links.collect { |l| l.to_hash } )
  end # def validate
end # class Host

Model.subclasses.each do |model|
  model_name = model.name.downcase

  p "Setting up GET /#{model_name}/:id"
  get "/#{model_name}/:id" do |id|
    obj = model[id]
    # Return 404 if this object is not found
    return 404 if obj.nil?

    # Otherwise, return the json representation of this object.
    return obj.to_json
  end # get /model/:id

  p "Setting up PUT /#{model_name}/:id"
  put "/#{model_name}/:id" do |id|
    p :PUT => id, :class => model
    data = {:id => id}

    # Merge in the JSON body if there is one.
    body = request.body.read
    data.merge!(JSON.parse(body)) if !body.empty?

    # Create a new instance of this model.
    # TODO(sissel): Actually we should create-or-update.
    p model_name => data
    object = model.create(data)
    if object.valid?
      return object.to_json
    else
      return object.errors.to_json
    end
  end # put /model/:id

  if model.include?(Linkable)
    p "Setting up PUT /#{model_name}/:id/link/:model/:id"
    put "/#{model_name}/:id/link/:model/:id" do |id, peer_model, peer_id|
      obj = model[id]
      # Return 404 if this object is not found
      return 404 if obj.nil?
      p obj.links
      link = Link.create(:model => peer_model, :object_id => peer_id)
      p :link_hash => link.to_hash
      p :link_valid => link.valid?, :errors => link.errors

      obj.links << link
    end
  end
end
