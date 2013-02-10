#!/bin/sh

jar=example.jar
echo "Copying jar"
cp ~/build/jruby/lib/jruby-complete.jar $jar

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

echo "Running jar"
java -jar $jar | tee out
