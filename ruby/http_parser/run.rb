
version = RUBY_VERSION
platform = case RUBY_PLATFORM
  when "java"; "jruby-#{JRUBY_VERSION}"
  else "ruby"
end


Dir.mkdir("output") unless File.directory?("output")
file = [platform,version].join("@")
output = File.new("output/#{file}", "w")
$stdout.reopen(output)
puts [version, platform].join(" @ ")
puts "-" * 80
puts
load "./test.rb"
