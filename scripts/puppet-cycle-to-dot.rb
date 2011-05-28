#!/usr/bin/env ruby
#
# Reads from stdin.
# The input is expected to match puppet's error output when there is a
# dependency cycle found.
# 
# The output looks like this:
#
# """
# err: Could not apply complete catalog: Found dependency cycles in the
# following relationships: < list of relationships >; try using the '--graph'
# option ...
# """
#
# The --graph option generates a graph with all relationships and is usually
# quite hard to read.
# This script will take the error output which only includes the cycles and 
# give you a .dot output that is reasonable.
#
# Take the output and use graphviz (for example) and convert to pdf for view:
#   Like 'circo' circular graph display:
#   % circo -Tpdf yourdotfile > cycles.pdf

require "rubygems"
require "erb"
require "ap"

data = $stdin.read
data.gsub!(/^err:.*: /, "")
data.gsub!(/; try using the '--graph'.*/, "")

edges = data.split(/, */).collect { |e| e.chomp }
verteces = edges.collect { |edge| edge.split(" => ") }.flatten.collect { |v| v.chomp }

template = ERB.new <<-ERB
digraph Dependencies {
  label = "Dependencies"
  graph [fontsize=24]
  node [fontsize=24]
  <% verteces.each do |vertex| %>
  "<%= vertex %>" [
    label = "<%= vertex %>"
  ]
  <% end %>

  <% edges.each do |edge| %>
  <%   left, right = edge.split(" => ") %>
  "<%= left %>" -> "<%= right %>" [ ]
  <% end %>
}
ERB

puts template.result(binding)
