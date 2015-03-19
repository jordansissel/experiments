# encoding: utf-8
require "time"
require "json"
require "java"

HandshakeListener = Class.new do
  def initialize(mutex, cv)
    @mutex = mutex
    @cv = cv
  end
  def handshakeCompleted(event)
    @mutex.synchronize do
      @cv.signal
    end
  end

  def wait(&block)
    @mutex.synchronize do
      block.call
      @cv.wait(@mutex)
    end
  end
end

    # Trust everything. We're just wanting to test handshake cipher problems, not
    # certificate problems.
TrustAllTheNiceCertificates = Class.new do
  include javax.net.ssl.X509TrustManager
  def getAcceptedIssuers; end
  def checkClientTrusted(certs, authtype); end
  def checkServerTrusted(certs, authtype); end
end

class SSLTrainToFunkyTown
  def context
    #return @context if @context
    context = javax.net.ssl.SSLContext.getInstance("SSL");
    context.init(nil, [ TrustAllTheNiceCertificates.new ], java.security.SecureRandom.new)
    context
  end

  def sslfactory
    sslfactory ||= context.getSocketFactory
  end

  def try_handshake(host, port)
    mutex = Mutex.new
    cv = ConditionVariable.new

    tcp = java.net.Socket.new(host, port)
    address = tcp.getInetAddress
    ssl = sslfactory.createSocket(tcp, host, port, true)
    ssl.setUseClientMode(true)

    # This cipher is known to fail intermittently against rubygems.org
    ssl.setEnabledCipherSuites([ "TLS_DHE_RSA_WITH_AES_128_CBC_SHA" ])
    handshake_listener = HandshakeListener.new(mutex, cv)
    ssl.addHandshakeCompletedListener(handshake_listener)
    handshake_listener.wait { ssl.startHandshake }
    return true, nil, { :address => address }
  rescue => e
    return false, e, { :address => address }
  ensure
    ssl.close if ssl
  end

  def run(args)
    log = File.new("javassl.log", "a")
    services = []
    args.each do |arg|
      host = arg
      port = 443
      if host =~ /:/
        host, port = host.split(":", 2)
        port = port.to_i
      end
      services << { :host => host, :port => port }
    end

    results = Hash.new { |h,k| h[k] = { :success => 0, :failures => 0, :exceptions => [] } }
    while true
      services.each do |target|
        name = "#{target[:host]}:#{target[:port]}"
        success, exception, info = try_handshake(target[:host], target[:port])

        now = Time.now.utc
        event = {"@timestamp" => now.iso8601(3), "pid" => $$}.merge(info)
        if success
          results[name][:success] += 1
          event["result"] = "success"
        else
          results[name][:failures] += 1
          results[name][:exceptions] << exception
          event["result"] = "failure"
          event["exception"] = exception.to_s
        end
        log.puts(event.to_json)

        results.each do |name, result|
          puts "#{"%20s" % name}: #{"%5d" % result[:success]}✅  #{"% 5d" % result[:failures]}❌    #{result[:exceptions].collect(&:to_s).reduce(Hash.new { |h,v| h[v] = 0 }) { |m,v| m[v] += 1; m }}"
        end
        return unless success
      end

      # Be kind-ish to our downstream servers.
      sleep(rand * 0.1)
    end
  end
end

SSLTrainToFunkyTown.new.run(ARGV)
