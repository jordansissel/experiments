#!/usr/bin/env ruby
#

require 'rubygems'
require 'bunny'

bunny = Bunny.new()
puts bunny.start
