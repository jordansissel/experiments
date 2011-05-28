#!/usr/bin/env ruby
#

require "rubygems"
require "puppet" # gem puppet
require "ap" # gem awesome_print

# Need to define a type for each type we want to have.
# Otherwise, unknown types are errors in puppet.
Puppet::Type.newtype(:input) do
  @doc = "Hello"
  provider = :hugs
  ensurable

  newparam(:name, :namevar => true) do
    @doc = "Input URL"
  end # property :name

  newparam(:tags) do
    @doc = "Tags for an input"
  end # property 'tags'
end # type 'input'

Puppet::Type.type(:input).provide(:hugs) do
  @doc = "Hugs"

  def create
    puts "create"
  end

  def destroy
    puts "destroy"
  end

  def exists?
    puts "exists?"
    return false
  end
end

# Now compile a catalog from our code.
Puppet::Util::Log.newdestination(:console) 
Puppet::Util::Log.level = :debug
Puppet[:trace] = true

i = Puppet::Type.type(:input).new(:name => "pants")
