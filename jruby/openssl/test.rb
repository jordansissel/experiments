require "thread"
require "net/http"
require "openssl"
require "uri"

uri = URI.parse("https://rubygems.org/gems/O_o-1.0.0.gem")

threads = 5
iterations = 10000000
delay = 0.1

Thread.abort_on_exception = true
eureka = Mutex.new

threads.times.collect do 
  Thread.new do
    iterations.times do
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      #http.set_debug_output = STDERR
      #eureka.synchronize do
        begin
          http.get(uri.request_uri)
        rescue => e
          p e
        end
      #end
      sleep(delay)
    end
    p :done
  end
end.map(&:join)
