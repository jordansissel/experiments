
jruby="jruby-complete-1.7.0.jar"
gemdir="./gems"
[ ! -f $jruby ] && wget http://jruby.org.s3.amazonaws.com/downloads/1.7.0/jruby-complete-1.7.0.jar

export GEM_HOME=$gemdir
export GEM_PATH=$gemdir
java -jar $jruby -S gem install --install-dir $gemdir rails

# Make a jar with rails + jruby
mkdir ./build
(cd build; jar xf ../$jruby)
rsync -a $gemdir/ build
jar cfe jruby-rails.jar org.jruby.Main -C build .
