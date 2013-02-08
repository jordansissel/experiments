#!/bin/sh

cp ~/build/jruby/lib/jruby-complete.jar .

cat > runner.rb <<RUBY
start = Time.now
begin
  require "geoip"
rescue LoadError => e
  puts e
end
duration = Time.now - start
puts "Duration: #{duration}"
RUBY

# Add the gems
jar uf jruby-complete.jar -C /home/jls/projects/logstash/vendor/bundle/jruby/1.9 gems
# Compile runner.rb
java -jar jruby-complete.jar -S jrubyc runner.rb
# Set it as the entry point
jar uf jruby-complete.jar runner.class
jar ufe jruby-complete.jar runner
#jar i jruby-complete.jar

java -jar jruby-complete.jar
GEM_HOME="file://$PWD/jruby-complete.jar!gems" java -jar jruby-complete.jar
