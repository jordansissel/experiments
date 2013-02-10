
def boomstick(path)
  start = Time.now
  loaded_before = $LOADED_FEATURES.clone
  begin
    require(path)
  rescue LoadError => e
    puts e.class => e.to_s
  end
  load_delta = $LOADED_FEATURES - loaded_before
  duration = Time.now - start
  puts "require(#{path}) took #{duration}"
  puts "  files loaded: #{load_delta.count}"
end
#require "./monkeypatch"
ps = Gem::PathSupport.new
p ps.home
p ps.path
boomstick("geoip") # should succeed

#jar = File.new("./example.jar")
#file = java.io.File.new("./example.jar")
#puts Stud::Benchmark.runtimed(10) do

  #start = Time.now
  #zip = java.util.zip.ZipFile.new(file)
#1000.times do
  #zip.getEntry("gems/cabin-0.5.0/lib/cabin.rb")
#/home/jls/projects/experiments/ruby/jruby-packaging/example.jar
#boomstick("this-does-not-exist") # show failed load case
#boomstick("geoip") # this should succeed
#boomstick("ftw")
#boomstick("geoip") # do it twice to time it
#boomstick("ftw") # another success
#boomstick("this-does-not-exist") # show failed load case
#boomstick("this-does-not-exist") # show failed load case x2
#puts :total_gems_known => Gem::Specification.count
