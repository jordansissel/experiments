
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

boomstick("json") # should succeed
boomstick("geoip") # this should succeed
boomstick("this-does-not-exist") # show failed load case
boomstick("geoip") # do it twice to time it
boomstick("ftw") # another success
boomstick("this-does-not-exist") # show failed load case
boomstick("this-does-not-exist") # show failed load case x2
