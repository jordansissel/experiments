# Parses output of nagios plugins and tries to make it something less crappy.
#

# run a command, take the output.
# nagios says first line is
# message | perfdata
# message2
# ...
# messageN | perfdata2
# perfdata3
# ...
# perfdata4
#

require "./subprocess.rb"

class NagiosPlugin
  public
  def initialize(*args)
    args = args.first if args.first.is_a?(Array)
    @subprocess = Subprocess.new(args)
    @started = false
    @text = []
    @perfdata = {}
  end # def initialize

  public
  def start
    @subprocess.start if !@started
    @started = true
  end # def start

  public
  def run
    start if !@started
    parse
    error_messages = @subprocess.stderr.read
    @subprocess.stderr.close
    @subprocess.wait

    @status = @subprocess.status.exitstatus
    @signal = @subprocess.status.termsig

    p :error_messages => error_messages
    p :text => @text
    p :perfdata => @perfdata
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
end # class NagiosPlugin

class NagiosPerfData
  @@perfdata_re = nil

  public
  def self.initialize
    # from http://nagiosplug.sourceforge.net/developer-guidelines.html#AEN201
    # 'label'=value[UOM];[warn];[crit];[min];[max]
    #   label can be quoted (especially if it has '=' or ' ')
    #
    #   UOM is the unit, and can be
    #     * nothing
    #     * 's' 'ms' 'us' (timing)
    #     * B, KB, MB, GB, TB, etc
    #     * 'c' a counter
    #     * '%' a percentage
    # http://nagiosplug.sourceforge.net/developer-guidelines.html#THRESHOLDFORMAT
    # 'warn' and 'crit' are in "range" format, documented above, but I've never
    # seen it in use. If you use it, let me (jordan) know.
    q = "'(?:[^']+|\\.)+'"
    qq = "\"(?:[^\"]+|\\.)+\""
    label = "(#{q}|#{qq}|[^ =]+)"
    value = "([0-9-]+)"
    min = max = "(?:;([0-9-]+)?)?"
    warn = crit = "(?:;([0-9-]+)?)?"
    uom = "([mu]?s|[KMGTP]B|c|%)?"
    @@perfdata_re = /#{label}=#{value}#{uom}#{warn}#{crit}#{min}#{max}/
  end # def self.initialize

  public
  def self.ready
    return !@@perfdata_re.nil?
  end # def self.ready

  # The name of this metric
  attr_reader :label

  # The current value of this metric
  attr_reader :value

  # The unit for this metric ("%", "MB", "c" (counter), etc)
  attr_reader :unit
 
  # 'warning' threshold level
  attr_reader :warn

  # 'critical' threshold level
  attr_reader :critical

  # minimum value possible for this metric
  attr_reader :min

  # maximum value possible for this metric
  attr_reader :max

  public
  def initialize(options)
    @label = options[:label]
    @value = options[:value]
    @unit = options[:unit]
    @warn = options[:warn]
    @critical = options[:critical]
    @min = options[:min]
    @max = options[:max]
  end # def initialize

  def self.parse(string, &block)
    initialize unless ready
    string.scan(@@perfdata_re) do |captures|
      label, value, unit, warn, critical, min, max = captures
      yield NagiosPerfData.new(
        :label => label,
        :value => value.to_f,
        :unit => unit,
        :warn => warn.to_f,
        :critical => critical.to_f,
        :min => min.to_f,
        :max => max.to_f
      )
    end
  end # def self.parse
end # class NagiosPerfData

plugin = NagiosPlugin.new("/home/jls/bin/check_disk", "-w", "99", "-c", "99")
plugin.run
