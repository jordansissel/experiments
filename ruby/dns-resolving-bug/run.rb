require "socket"

# Ruby 1.8.7 lacks RUBY_ENGINE, so fake it.
hostname = ARGV[0]
platform = "#{RUBY_VERSION}[p#{RUBY_PATCHLEVEL}]/#{RUBY_ENGINE rescue "ruby"}"
name, aliases, family, *results = Socket.gethostbyname(ARGV[0])
family_name = {Socket::AF_INET => "IPv4", Socket::AF_INET6 => "IPv6" }[family]

p [platform, family_name, results]
