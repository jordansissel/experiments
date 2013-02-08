
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
