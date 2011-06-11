# Parses output of nagios plugins and tries to make it something less crappy.
#
# When talking monitoring, the #1 reason folks use nagios appears to be due
# to the ease of writing plugins. This is reasonable. So let's make 
# nagios plugins usable elsewhere.
#

require "./subprocess"
require "./nagiosperfdata"

class NagiosPlugin
  attr_reader :text
  attr_reader :perfdata
  attr_reader :errors

  public
  def initialize(*args)
    # accept array of args, or invoked as NagiosPlugin.new(arg1, arg2, arg3, ...)
    args = args.first if args.first.is_a?(Array)
    @subprocess = Subprocess.new(args)
    @started = false
    @text = []
    @perfdata = {}
  end # def initialize

  public
  def start
    @subprocess.start unless @started
    @started = true
  end # def start

  public
  def run
    start
    parse
    error_messages = @subprocess.stderr.read
    @subprocess.stderr.close
    @subprocess.wait

    @status = @subprocess.status.exitstatus
    @signal = @subprocess.status.termsig

    p :error_messages => error_messages
    p :text => @text
    p :perfdata => @perfdata
    p :status => status
  end # def run

  private
  def parse_perfdata(data)
    return if data.nil?
    NagiosPerfData.parse(data) do |perf|
      @perfdata[perf.label] = perf
    end
  end # def parse_perfdata

  public
  def parse
    n = 0
    state = :text_and_perfdata
    @subprocess.stdout.each_line do |line|
      n += 1
      if n == 1
        text, perfdata = line.split("|")
        @text << text
        parse_perfdata(perfdata) if !perfdata.nil?
        next
      end

      # if line includes perfdata now, all remaining lines are perfdata, too
      case state
        when :text_and_perfdata
          text, perfdata = line.split("|")
          @text << text
          if !perfdata.nil?
            parse_perfdata(perfdata)
            state = :perfdata_only
          end
        when :perfdata_only
          parse_perfdata(perfdata)
        else
          $stderr.puts \
            "Unexpected state '#{state.inspect}' in parser. This is a bug."
      end # case state
    end
    @subprocess.stdout.close
  end # def parse

  public
  def status
    start
    codes = {
      0 => :ok,
      1 => :warning,
      2 => :critical,
      3 => :unknown,
    }

    code = @subprocess.status.exitstatus

    return (codes[code] or :unknown)
  end # def status
end # class NagiosPlugin


#plugin = NagiosPlugin.new("/home/jls/bin/check_disk", "-w", "99", "-c", "99")
plugin = NagiosPlugin.new(*ARGV)
plugin.run
