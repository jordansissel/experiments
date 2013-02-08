#!/bin/sh

jar=example.jar
echo "Copying jar"
cp ~/build/jruby/lib/jruby-complete.jar $jar

echo "Generating runner"
cat > runner.rb <<RUBY

def boomstick(path)
  start = Time.now
  begin
    require(path)
  rescue LoadError => e
    puts e.class => e.to_s
  end
  duration = Time.now - start
  puts "require(#{path}) took #{duration}"
end

boomstick("geoip") # this should succeed
boomstick("geoip") # do it twice to time it
boomstick("ftw") # another success
boomstick("json") # another success
boomstick("this-does-not-exist") # show failed load case
boomstick("this-does-not-exist") # show failed load case x2
RUBY

echo "Adding gems to the jar"
jar uf $jar \
  -C /home/jls/projects/logstash/vendor/bundle/jruby/1.9 gems \
  -C /home/jls/projects/logstash/vendor/bundle/jruby/1.9 specifications

echo "Compiling runner"
java -jar $jar -S jrubyc runner.rb
# Set it as the entry point

echo "Adding runner.class to the jar"
jar uf $jar runner.class

echo "Setting runner as entry point"
jar ufe $jar runner

#echo "Indexing jar"
#jar i $jar
