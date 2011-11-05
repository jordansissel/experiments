#!/usr/bin/env ruby
#

require "rubygems"
require "ohm"
require "sinatra"
require "json"

require "./model"
require "./models/deployment"
require "./models/host"
require "./models/link"
require "./models/role"
require "./models/mixins/linkable"
require "./models/mixins/nameable"

def restify(model, hash)
  if model.include?(Linkable) and !hash[:links].nil?
    # Convert all 'links' to paths /model/id
    hash[:links] = hash[:links].collect do |l| 
      "/#{l[:model]}/#{l[:object_id]}" 
    end
  end
end # def restify

# For all Model subclasses, make REST APIs for them.
Model.subclasses.each do |model|
  model_name = model.name.downcase

  p "Setting up GET /#{model_name}/:id"
  get "/#{model_name}/:id" do |id|
    obj = model[id]
    # Return 404 if this object is not found
    return 404 if obj.nil?

    result = obj.to_hash
    restify(model, result)

    # Otherwise, return the json representation of this object.
    return result.to_json
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
      return restify(model, object.to_hash).to_json
    else
      return object.errors.to_json
    end
  end # put /model/:id

  if model.include?(Linkable)
    p "Setting up PUT /#{model_name}/:id/link/:model/:id"
    # Putting a link takes no body because all the data we need right now
    # is the model and the object id you want to link to.
    put "/#{model_name}/:id/link/:model/:id" do |id, peer_model, peer_id|
      obj = model[id]
      # Return 404 if this object is not found
      return 404 if obj.nil?

      # TODO(sissel): Links should take arbitrary data, should they not?
      link_data = { :model => peer_model, :object_id => peer_id }
      link = Link.find(link_data).first || Link.create(link_data)
      p :link => link
      p :link_hash => link.to_hash
      p :link_valid => link.valid?, :errors => link.errors
      obj.links << link
    end
  end
end
