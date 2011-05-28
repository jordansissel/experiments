

require 'rubygems'
require 'dm-core'

class Person
  include DataMapper::Resource

  property :id, Serial, :key => true
  property :name, String
  #has n, :persons, :through => Resource
  property :parent_id, Integer, :required => false
  has n, :children, :model => 'Person', :child_key => [ :parent_id ]
  belongs_to :parent, :model => 'Person', :child_key => [ :parent_id ]
end

DataMapper.setup(:default, 'sqlite3::memory:')
DataMapper.auto_migrate!
a = Person.new(:name => "A")
b = Person.new(:name => "B")
c = Person.new(:name => "C")
a.children << b
a.children << c
a.save
c.save

puts Person.first(:name => "A").children
