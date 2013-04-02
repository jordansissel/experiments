# Manager launches Workers
# Misbehaving workers can be destroyed.

require "ffi-rzmq"
require "spoon"

class Manager
  def initialize
    @next_id = 0
    @context = ZMQ::Context.new
    @mi = @context.socket(ZMQ::REP)
    
    @mi_listen_endpoint = "tcp://127.0.0.1:3439"
    @mi_child_endpoint = "tcp://127.0.0.1:3439"
  end

  def create_worker
    args = [ ]
    if RUBY_PLATFORM == "java"
      # TODO(sissel): Detect when we are running as JRuby outside of a jar?
      jruby_jar = $LOADED_FEATURES.first[/file:[^!]+/].gsub(/^file:/, "")
      args = []

      # Copy in any jruby or jffi properties
      java.lang.System.getProperties.each do |key, value|
        next unless key =~ /^(jffi|jruby)\./
        args += [ "-D#{key}=#{value}" ]
      end

      # java memory flags
      args += [ "-Xmx500m", "-Xss2048k" ]

      # class + jruby flags
      args += [ "-cp", jruby_jar, "org.jruby.Main", "--1.9" ]
    end

    # Run worker-launch.rb and give it our zmq endpoint
    args += [ File.expand_path(File.join(__FILE__, "../worker-launch.rb")), @mi_child_endpoint ]

    # Launch; return the pid.
    pid = Spoon.spawn("/proc/#{$$}/exe", *args)
    return pid
  end

  def run
    @mi.bind(@mi_listen_endpoint)
    m = ""
    while true
      rc = @mi.recv_string(m, 0)
      if rc < 0
        break
      end
      p :received => m
      m = ""
      @mi.send_string("WORLD")
    end
  end
end

if __FILE__ == $0
  f = Manager.new
  t = Thread.new { f.run }
  pid = f.create_worker
  p :pid => pid
  _, status = Process.wait2(pid)
  p :status => status.exitstatus
  raise "sigh"
end
