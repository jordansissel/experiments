%%{
  # How to use this file.
  # Run: ragel -R syslog_protocol.rl
  # This will generate 'syslog_protocol.rb' which you can run to do this perf test.

  machine syslog_rfc3164;

  # Keep the current buffere position in instance variable '@pos' rather than
  # the default local variable 'p'
  variable p @pos ;
   
  # notes:
  # '@pos' is the current index in the string being parsed.
  # 'cs' is the current state (ragel is a state machine)
  #
  # Literal ">" means enter actions
  # Literal "%" means leaving action.
  #
  # In general, if we care about matched values, we will
  # mark at the enter (which pushes the current position on the stack)
  # and popstring at the leaving.

  pri = ( "<" [0-9]{1,3} ">" ) >{mark("pri")}
    %{ 
      @pri = popstring("pri")[1...-1].to_i # trim '<' and '>'
      # pri == (facility * 8) + severity
      # TODO(sissel): maybe just make these getter functions.
      @severity = @pri & 8  
      @facility = @pri >> 1
    } ;

  month = ( "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun"
            | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec" ) ;

  day = ((" "? [1-9]) | ([12] [0-9]) | ("3" [01])) ;
  hour = (([01] [0-9]) | "2" [0-4]) ;
  minute = ([0-5][0-9]) ;
  second = ([0-5][0-9]) ;

  time = ( hour ":" minute ":" second ) ;
  timestamp = ( month " " day " " time ) 
    >{mark("timestamp")} 
    %{ @timestamp = popstring("timestamp") };

  # RFC 3164 says "Domain Name MUST NOT be included in the HOSTNAME field"
  # But we'll ignore that because that's a stupid requirement and I'm
  # not really convinced people follow it.
  # The grammar for hostname here should match any ipv4, ipv6, or hostname.
  hostname = ([A-Za-z0-9_.:]+) >{mark("hostname")} %{ @hostname = popstring("hostname") };

  header = timestamp " " hostname ;
  message = (32..127)+ >{mark("message")} %{ @message = popstring("message") } ;

  # RFC 3164 section 4.1.2
  payload = ( pri header " " message ) ;

  main := payload
          $err {
            # Compute line and column of the cursor (@pos)
            $stderr.puts "Error at line #{self.line(string, @pos)}, column #{self.column(string, @pos)}: #{string[@pos .. -1].inspect}"
            # TODO(sissel): Note what we were expecting?
          } ;

}%%


class Syslog3164
  # syslog attributes
  attr_accessor :pri
  attr_accessor :facility
  attr_accessor :severity
  attr_accessor :timestamp
  attr_accessor :hostname
  attr_accessor :message

  #attr_accessor :eof

  def initialize
    # BEGIN RAGEL DATA
    %% write data;
    # END RAGEL DATA
  end

  def parse(string)
    @markstack = []
    @string = string

    # Have to reset @pos because Ragel doesn't.
    @pos = 0

    data = string.unpack("c*")

    # Ragel needs to be told how long 'data' is so it knows when to trigger EOF.
    eof = data.size

    # BEGIN RAGEL INIT
    %% write init;
    # END RAGEL INIT

    begin
      # BEGIN RAGEL EXEC
      %% write exec;
      # END RAGEL EXEC
    rescue => e
      # TODO(sissel): report error appropriately?
      raise e
    end

    if cs < self.syslog_rfc3164_first_final
      $stderr.puts "Error at line #{self.line(string, @pos)}, column #{self.column(string, @pos)}: #{string[@pos .. -1].inspect}"
      raise "Invalid payload: #{string}"
    end
  end # def parse

  def line(str, pos)
    return str[0 .. pos].count("\n") + 1
  end

  def column(str, pos)
    return str[0 .. pos].split("\n").last.length
  end

  # Pop a string off the stack. Requires you've called 'mark' at least once prior.
  #
  # 'info' is an optional argument that can aid in debugging; give a string
  # that identifies why or what you are marking.
  def popstring(info)
    # pop a string based on the last mark
    if @markstack.size == 0
      raise "No previous mark, cannot pop string."
    end

    value = @string[@markstack.pop ... @pos]
    #puts "Popping string for #{info.inspect} (#{@markstack.size} pops left): #{value.inspect}"
    return value
  end # def popstring

  # Push the current parser position onto the stack
  # 'info' is an optional argument that can aid in debugging; give a string
  # that identifies why or what you are marking.
  def mark(info=nil)
    #puts "Marking #{@pos} for #{info.inspect}"
    @markstack.push(@pos)
  end
end # class Syslog3164

#if __FILE__ == $0
  # This is the perf test.
  # It will parse the same syslog message over and over.
  start = Time.now
  count = 10000

  rfc3164 = Syslog3164.new
  count.times do |i|
    begin
      rfc3164.parse("<12>Mar  1 15:43:35 snack kernel: Kernel logging (proc) stopped.")
    rescue => e
      puts "Error on attempt #{i + 1}"
      raise e
    end
  end
  duration = Time.now - start
  version = "#{RUBY_PLATFORM}/#{RUBY_VERSION}"
  version += "/#{JRUBY_VERSION}" if RUBY_PLATFORM == "java"
  puts "#{version}: duration: #{duration} / rate: #{count / duration} / iterations: #{count}"
#end
