#!/usr/bin/env ruby

require "rubygems/specification"
require "bundler"

gemspec = ARGV.shift

spec = Gem::Specification.load(gemspec)
deps = [spec.development_dependencies, spec.runtime_dependencies].flatten

# target for now
target = "vendor/bundle/jruby/1.9/"

#require "pry"; binding.pry
platform = Gem.platforms.first
bundlerdeps = deps.collect do |d|
  #Bundler::DepProxy.new(Bundler::Dependency.new(d.name, d.requirement), platform)
  Bundler::Dependency.new(d.name.to_s, d.requirement.to_s)
end
source = Bundler::Source::Rubygems.new
source.add_remote("https://rubygems.org")
index = Bundler::Index.build do |i|
  i.add_source(source.specs)
  i.add_source(source.instance_eval { remote_specs })
end
#p Bundler::Resolver.resolve(bundlerdeps, index)


require "pry"
binding.pry
definition = Bundler::Definition.new(Pathname.new("/tmp/x"), bundlerdeps, [source], {})
definition.resolve_remotely!
#definition.specs
#
#require "pry"
#binding.pry
