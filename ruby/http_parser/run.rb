
version = RUBY_VERSION
platform = case RUBY_PLATFORM
  when "java"; "jruby-JRUBY_VERSION"
  else RUBY_PLATFORM
end

puts [version, platform].join(" @ ")

file = [version,platform].join("-")
output = File.new(file, "w")
$stdout.reopen(output)
load "./test.rb"
