require "resolv"

# Ruby 1.8.7 lacks RUBY_ENGINE, so fake it.
hostname = ARGV[0]
platform = "#{RUBY_VERSION}[p#{RUBY_PATCHLEVEL}]/#{RUBY_ENGINE rescue "ruby"}"
results = Resolv::DNS.new.getaddresses(hostname)

p [platform, results]
