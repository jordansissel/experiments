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

# Resolve any joins (like Links) if asked or convert Link
# objects to path format.
def restify(model, hash, resolve_all=false)
  if model.include?(Linkable) and !hash[:links].nil?
    if resolve_all
      # If resolving all, then make :links a Hash of 
      #   { model => { object_id => linked_object, ... } }
      links = {}
      hash[:links].each do |l|
        # If resolve_all is set, we want the fully denormalized object returned.
        linked_model = ::Module.const_get(l[:model].capitalize)
        link = linked_model[l[:object_id]]
        #linked_model[l[:object_id]].to_hash
        links[l[:model]] ||= {}
        links[l[:model]][l[:object_id]] = link.to_hash
        #links["/#{l[:model]}/#{l[:object_id]}"] = link.to_hash
      end
      hash[:links] = links
    else
      # Convert all 'links' to paths "/model/id"
      hash[:links] = hash[:links].collect do |l| 
        "/#{l[:model]}/#{l[:object_id]}" 
      end
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
    p :params => params
    restify(model, result, params.include?("resolve_all"))

    # Otherwise, return the json representation of this object.
    headers "Content-Type" => "text/plain"
    body JSON.pretty_generate(result)
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
    headers "Content-Type" => "text/plain"
    if object.valid?
      result = object.to_hash
      restify(model, result, params.include?("resolve_all"))
      body JSON.pretty_generate(result)
    else
      body JSON.pretty_generate(object.errors)
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
      result = obj.to_hash
      restify(model, result, params.include?("resolve_all"))
      headers "Content-Type" => "text/plain"
      body JSON.pretty_generate(result)
    end

    get "/#{model_name}/:id/link/?" do |id|
      obj = model[id]
      # Return 404 if this object is not found
      return 404 if obj.nil?
      results = obj.links.collect { |l| l.to_hash }
      headers "Content-Type" => "text/plain"
      body JSON.pretty_generate(results)
    end

    get "/#{model_name}/:id/link/:model" do |id, peer_model|
      obj = model[id]
      # Return 404 if this object is not found
      return 404 if obj.nil?

      results = obj.links.select { |l| l.model == peer_model } \
        .collect { |l| l.to_hash }
      headers "Content-Type" => "text/plain"
      body JSON.pretty_generate(results)
    end
  end
end
