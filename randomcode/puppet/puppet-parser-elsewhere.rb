#!/usr/bin/env ruby
#

require "rubygems"
require "puppet" # gem puppet
require "ap" # gem awesome_print

# Need to define a type for each type we want to have.
# Otherwise, unknown types are errors in puppet.
Puppet::Type.newtype(:input) do
  @doc = "Hello"
  @provider = "hugs"
  ensurable

  newparam(:name, :namevar => true) do
    desc "Input URL"
  end # property :name

  newparam(:tags) do
    desc "Tags for an input"
  end # property 'tags'

  def prefetch
    puts "OK"
  end
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

# This is where we put the puppet manifest code. You could just use a file
# here, but I'm inlining it for easy reading.
Puppet[:code] = <<EOF
class foo {
  input {
    "test":
      tags => "linux-syslog";
  }
}

EOF

parser = Puppet::Parser::Parser.new("default")
result = parser.parse(Puppet[:code])
p result.hostclasses
exit
# Now compile a catalog from our code.
Puppet::Util::Log.newdestination(:console) 
Puppet::Util::Log.level = :debug
Puppet[:trace] = true
#facts = Puppet::Node::Facts.find(Puppet[:certname])
node = Puppet::Node.find("default")
#node.merge(facts)
#ap node
#ap facts
catalog = Puppet::Resource::Catalog.find("default", :use_node => node)
#catalog.finalize

#catalog.apply
# Each vertex is a resource.
catalog.vertices.each do |resource|
  #next if ["Class", "Stage"].include?(resource.type )
  puts "Found resource '#{resource.to_s}' with tags: #{resource[:tags].inspect}"
end

#i = Puppet::Type.type(:input).new(:name => "pants")

#transaction = Puppet::Transaction.new(catalog)
#begin
  #result = transaction.evaluate
  #ap result
#rescue Puppet::Error => detail
  #puts detail.backtrace if Puppet[:trace]
  #Puppet.err "Could not apply complete catalog: #{detail}"
#rescue => detail
  #puts detail.backtrace if Puppet[:trace]
  #Puppet.err "Got an uncaught exception of type #{detail.class}: #{detail}"
#end

