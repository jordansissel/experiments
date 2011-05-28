
# line 1 "syslog_protocol.rl"

# line 64 "syslog_protocol.rl"



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
    
# line 23 "syslog_protocol.rb"
class << self
	attr_accessor :_syslog_rfc3164_actions
	private :_syslog_rfc3164_actions, :_syslog_rfc3164_actions=
end
self._syslog_rfc3164_actions = [
	0, 1, 0, 1, 3, 1, 4, 1, 
	5, 1, 6, 1, 7, 1, 8, 2, 
	1, 2
]

class << self
	attr_accessor :_syslog_rfc3164_key_offsets
	private :_syslog_rfc3164_key_offsets, :_syslog_rfc3164_key_offsets=
end
self._syslog_rfc3164_key_offsets = [
	0, 0, 1, 3, 6, 9, 10, 18, 
	20, 21, 22, 28, 30, 31, 34, 36, 
	37, 39, 41, 42, 44, 46, 47, 55, 
	64, 66, 68, 71, 74, 75, 76, 77, 
	78, 79, 81, 82, 84, 85, 87, 88, 
	89, 90, 91, 92, 93
]

class << self
	attr_accessor :_syslog_rfc3164_trans_keys
	private :_syslog_rfc3164_trans_keys, :_syslog_rfc3164_trans_keys=
end
self._syslog_rfc3164_trans_keys = [
	60, 48, 57, 62, 48, 57, 62, 48, 
	57, 62, 65, 68, 70, 74, 77, 78, 
	79, 83, 112, 117, 114, 32, 32, 51, 
	49, 50, 52, 57, 49, 57, 32, 50, 
	48, 49, 48, 57, 58, 48, 53, 48, 
	57, 58, 48, 53, 48, 57, 32, 46, 
	95, 48, 58, 65, 90, 97, 122, 32, 
	46, 95, 48, 58, 65, 90, 97, 122, 
	32, 127, 48, 52, 32, 48, 57, 32, 
	48, 49, 103, 101, 99, 101, 98, 97, 
	117, 110, 108, 110, 97, 114, 121, 111, 
	118, 99, 116, 101, 112, 32, 127, 0
]

class << self
	attr_accessor :_syslog_rfc3164_single_lengths
	private :_syslog_rfc3164_single_lengths, :_syslog_rfc3164_single_lengths=
end
self._syslog_rfc3164_single_lengths = [
	0, 1, 0, 1, 1, 1, 8, 2, 
	1, 1, 2, 0, 1, 1, 0, 1, 
	0, 0, 1, 0, 0, 1, 2, 3, 
	0, 0, 1, 1, 1, 1, 1, 1, 
	1, 2, 1, 2, 1, 2, 1, 1, 
	1, 1, 1, 1, 0
]

class << self
	attr_accessor :_syslog_rfc3164_range_lengths
	private :_syslog_rfc3164_range_lengths, :_syslog_rfc3164_range_lengths=
end
self._syslog_rfc3164_range_lengths = [
	0, 0, 1, 1, 1, 0, 0, 0, 
	0, 0, 2, 1, 0, 1, 1, 0, 
	1, 1, 0, 1, 1, 0, 3, 3, 
	1, 1, 1, 1, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 1
]

class << self
	attr_accessor :_syslog_rfc3164_index_offsets
	private :_syslog_rfc3164_index_offsets, :_syslog_rfc3164_index_offsets=
end
self._syslog_rfc3164_index_offsets = [
	0, 0, 2, 4, 7, 10, 12, 21, 
	24, 26, 28, 33, 35, 37, 40, 42, 
	44, 46, 48, 50, 52, 54, 56, 62, 
	69, 71, 73, 76, 79, 81, 83, 85, 
	87, 89, 92, 94, 97, 99, 102, 104, 
	106, 108, 110, 112, 114
]

class << self
	attr_accessor :_syslog_rfc3164_indicies
	private :_syslog_rfc3164_indicies, :_syslog_rfc3164_indicies=
end
self._syslog_rfc3164_indicies = [
	1, 0, 2, 0, 4, 3, 0, 4, 
	5, 0, 4, 0, 6, 7, 8, 9, 
	10, 11, 12, 13, 0, 14, 15, 0, 
	16, 0, 17, 0, 18, 20, 19, 21, 
	0, 21, 0, 22, 0, 24, 23, 0, 
	25, 0, 26, 0, 27, 0, 28, 0, 
	29, 0, 30, 0, 31, 0, 32, 0, 
	33, 33, 33, 33, 33, 0, 34, 35, 
	35, 35, 35, 35, 0, 36, 0, 25, 
	0, 22, 21, 0, 22, 21, 0, 16, 
	0, 37, 0, 16, 0, 38, 0, 16, 
	0, 39, 40, 0, 16, 0, 16, 16, 
	0, 41, 0, 16, 16, 0, 42, 0, 
	16, 0, 43, 0, 16, 0, 44, 0, 
	16, 0, 45, 0, 0
]

class << self
	attr_accessor :_syslog_rfc3164_trans_targs
	private :_syslog_rfc3164_trans_targs, :_syslog_rfc3164_trans_targs=
end
self._syslog_rfc3164_trans_targs = [
	0, 2, 3, 4, 6, 5, 7, 29, 
	31, 33, 36, 38, 40, 42, 8, 28, 
	9, 10, 11, 26, 27, 12, 13, 14, 
	25, 15, 16, 17, 18, 19, 20, 21, 
	22, 23, 24, 23, 44, 30, 32, 34, 
	35, 37, 39, 41, 43, 44
]

class << self
	attr_accessor :_syslog_rfc3164_trans_actions
	private :_syslog_rfc3164_trans_actions, :_syslog_rfc3164_trans_actions=
end
self._syslog_rfc3164_trans_actions = [
	13, 1, 0, 0, 0, 0, 15, 15, 
	15, 15, 15, 15, 15, 15, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	3, 5, 7, 0, 9, 0, 0, 0, 
	0, 0, 0, 0, 0, 0
]

class << self
	attr_accessor :_syslog_rfc3164_eof_actions
	private :_syslog_rfc3164_eof_actions, :_syslog_rfc3164_eof_actions=
end
self._syslog_rfc3164_eof_actions = [
	0, 13, 13, 13, 13, 13, 13, 13, 
	13, 13, 13, 13, 13, 13, 13, 13, 
	13, 13, 13, 13, 13, 13, 13, 13, 
	13, 13, 13, 13, 13, 13, 13, 13, 
	13, 13, 13, 13, 13, 13, 13, 13, 
	13, 13, 13, 13, 11
]

class << self
	attr_accessor :syslog_rfc3164_start
end
self.syslog_rfc3164_start = 1;
class << self
	attr_accessor :syslog_rfc3164_first_final
end
self.syslog_rfc3164_first_final = 44;
class << self
	attr_accessor :syslog_rfc3164_error
end
self.syslog_rfc3164_error = 0;

class << self
	attr_accessor :syslog_rfc3164_en_main
end
self.syslog_rfc3164_en_main = 1;


# line 81 "syslog_protocol.rl"
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
    
# line 203 "syslog_protocol.rb"
begin
	 @pos  ||= 0
	pe ||= data.length
	cs = syslog_rfc3164_start
end

# line 98 "syslog_protocol.rl"
    # END RAGEL INIT

    begin
      # BEGIN RAGEL EXEC
      
# line 216 "syslog_protocol.rb"
begin
	_klen, _trans, _keys, _acts, _nacts = nil
	_goto_level = 0
	_resume = 10
	_eof_trans = 15
	_again = 20
	_test_eof = 30
	_out = 40
	while true
	_trigger_goto = false
	if _goto_level <= 0
	if  @pos  == pe
		_goto_level = _test_eof
		next
	end
	if cs == 0
		_goto_level = _out
		next
	end
	end
	if _goto_level <= _resume
	_keys = _syslog_rfc3164_key_offsets[cs]
	_trans = _syslog_rfc3164_index_offsets[cs]
	_klen = _syslog_rfc3164_single_lengths[cs]
	_break_match = false
	
	begin
	  if _klen > 0
	     _lower = _keys
	     _upper = _keys + _klen - 1

	     loop do
	        break if _upper < _lower
	        _mid = _lower + ( (_upper - _lower) >> 1 )

	        if data[ @pos ] < _syslog_rfc3164_trans_keys[_mid]
	           _upper = _mid - 1
	        elsif data[ @pos ] > _syslog_rfc3164_trans_keys[_mid]
	           _lower = _mid + 1
	        else
	           _trans += (_mid - _keys)
	           _break_match = true
	           break
	        end
	     end # loop
	     break if _break_match
	     _keys += _klen
	     _trans += _klen
	  end
	  _klen = _syslog_rfc3164_range_lengths[cs]
	  if _klen > 0
	     _lower = _keys
	     _upper = _keys + (_klen << 1) - 2
	     loop do
	        break if _upper < _lower
	        _mid = _lower + (((_upper-_lower) >> 1) & ~1)
	        if data[ @pos ] < _syslog_rfc3164_trans_keys[_mid]
	          _upper = _mid - 2
	        elsif data[ @pos ] > _syslog_rfc3164_trans_keys[_mid+1]
	          _lower = _mid + 2
	        else
	          _trans += ((_mid - _keys) >> 1)
	          _break_match = true
	          break
	        end
	     end # loop
	     break if _break_match
	     _trans += _klen
	  end
	end while false
	_trans = _syslog_rfc3164_indicies[_trans]
	cs = _syslog_rfc3164_trans_targs[_trans]
	if _syslog_rfc3164_trans_actions[_trans] != 0
		_acts = _syslog_rfc3164_trans_actions[_trans]
		_nacts = _syslog_rfc3164_actions[_acts]
		_acts += 1
		while _nacts > 0
			_nacts -= 1
			_acts += 1
			case _syslog_rfc3164_actions[_acts - 1]
when 0 then
# line 23 "syslog_protocol.rl"
		begin
mark("pri")		end
# line 23 "syslog_protocol.rl"
when 1 then
# line 24 "syslog_protocol.rl"
		begin
 
      @pri = popstring("pri")[1...-1].to_i # trim '<' and '>'
      # pri == (facility * 8) + severity
      # TODO(sissel): maybe just make these getter functions.
      @severity = @pri & 8  
      @facility = @pri >> 1
    		end
# line 24 "syslog_protocol.rl"
when 2 then
# line 42 "syslog_protocol.rl"
		begin
mark("timestamp")		end
# line 42 "syslog_protocol.rl"
when 3 then
# line 43 "syslog_protocol.rl"
		begin
 @timestamp = popstring("timestamp") 		end
# line 43 "syslog_protocol.rl"
when 4 then
# line 49 "syslog_protocol.rl"
		begin
mark("hostname")		end
# line 49 "syslog_protocol.rl"
when 5 then
# line 49 "syslog_protocol.rl"
		begin
 @hostname = popstring("hostname") 		end
# line 49 "syslog_protocol.rl"
when 6 then
# line 52 "syslog_protocol.rl"
		begin
mark("message")		end
# line 52 "syslog_protocol.rl"
when 8 then
# line 58 "syslog_protocol.rl"
		begin

            # Compute line and column of the cursor (@pos)
            $stderr.puts "Error at line #{self.line(string, @pos)}, column #{self.column(string, @pos)}: #{string[@pos .. -1].inspect}"
            # TODO(sissel): Note what we were expecting?
          		end
# line 58 "syslog_protocol.rl"
# line 347 "syslog_protocol.rb"
			end # action switch
		end
	end
	if _trigger_goto
		next
	end
	end
	if _goto_level <= _again
	if cs == 0
		_goto_level = _out
		next
	end
	 @pos  += 1
	if  @pos  != pe
		_goto_level = _resume
		next
	end
	end
	if _goto_level <= _test_eof
	if  @pos  == eof
	__acts = _syslog_rfc3164_eof_actions[cs]
	__nacts =  _syslog_rfc3164_actions[__acts]
	__acts += 1
	while __nacts > 0
		__nacts -= 1
		__acts += 1
		case _syslog_rfc3164_actions[__acts - 1]
when 7 then
# line 52 "syslog_protocol.rl"
		begin
 @message = popstring("message") 		end
# line 52 "syslog_protocol.rl"
when 8 then
# line 58 "syslog_protocol.rl"
		begin

            # Compute line and column of the cursor (@pos)
            $stderr.puts "Error at line #{self.line(string, @pos)}, column #{self.column(string, @pos)}: #{string[@pos .. -1].inspect}"
            # TODO(sissel): Note what we were expecting?
          		end
# line 58 "syslog_protocol.rl"
# line 389 "syslog_protocol.rb"
		end # eof action switch
	end
	if _trigger_goto
		next
	end
end
	end
	if _goto_level <= _out
		break
	end
	end
	end

# line 103 "syslog_protocol.rl"
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
