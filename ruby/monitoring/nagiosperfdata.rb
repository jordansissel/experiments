
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
    value = "([0-9.-]+)"
    min = max = "(?:;([0-9.-]+)?)?"
    warn = crit = "(?:;([0-9.-]+)?)?"
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
    p :parsing => string
    string.scan(@@perfdata_re) do |captures|
      label, value, unit, warn, critical, min, max = captures
      yield NagiosPerfData.new(
        :label => label,
        :value => value.to_f,
        :unit => unit,
        :warn => warn.nil? ? nil : warn.to_f,
        :critical => critical.nil? ? nil : critical.to_f,
        :min => min.nil? ? nil : min.to_f,
        :max => max.nil? ? nil : max.to_f
      )
    end
  end # def self.parse
end # class NagiosPerfData
