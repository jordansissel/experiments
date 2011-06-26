
# line 1 "grammar.rl"
require "rubygems"


# line 47 "grammar.rl"


class Grammar
  attr_accessor :eof

  def initialize
    # BEGIN RAGEL DATA
    
# line 16 "grammar.rb"
class << self
	attr_accessor :_machinename_actions
	private :_machinename_actions, :_machinename_actions=
end
self._machinename_actions = [
	0, 1, 0, 1, 1, 1, 3, 1, 
	4, 2, 0, 3, 2, 2, 3
]

class << self
	attr_accessor :_machinename_key_offsets
	private :_machinename_key_offsets, :_machinename_key_offsets=
end
self._machinename_key_offsets = [
	0, 0, 7, 10, 10, 13, 13, 13
]

class << self
	attr_accessor :_machinename_trans_keys
	private :_machinename_trans_keys, :_machinename_trans_keys=
end
self._machinename_trans_keys = [
	34, 39, 95, 65, 90, 97, 122, 10, 
	34, 92, 10, 39, 92, 95, 48, 57, 
	65, 90, 97, 122, 0
]

class << self
	attr_accessor :_machinename_single_lengths
	private :_machinename_single_lengths, :_machinename_single_lengths=
end
self._machinename_single_lengths = [
	0, 3, 3, 0, 3, 0, 0, 1
]

class << self
	attr_accessor :_machinename_range_lengths
	private :_machinename_range_lengths, :_machinename_range_lengths=
end
self._machinename_range_lengths = [
	0, 2, 0, 0, 0, 0, 0, 3
]

class << self
	attr_accessor :_machinename_index_offsets
	private :_machinename_index_offsets, :_machinename_index_offsets=
end
self._machinename_index_offsets = [
	0, 0, 6, 10, 11, 15, 16, 17
]

class << self
	attr_accessor :_machinename_indicies
	private :_machinename_indicies, :_machinename_indicies=
end
self._machinename_indicies = [
	1, 2, 3, 3, 3, 0, 0, 5, 
	6, 4, 4, 0, 5, 8, 7, 7, 
	0, 9, 9, 9, 9, 0, 0
]

class << self
	attr_accessor :_machinename_trans_targs
	private :_machinename_trans_targs, :_machinename_trans_targs=
end
self._machinename_trans_targs = [
	0, 2, 4, 7, 2, 6, 3, 4, 
	5, 7
]

class << self
	attr_accessor :_machinename_trans_actions
	private :_machinename_trans_actions, :_machinename_trans_actions=
end
self._machinename_trans_actions = [
	7, 9, 9, 1, 5, 12, 5, 5, 
	5, 0
]

class << self
	attr_accessor :_machinename_eof_actions
	private :_machinename_eof_actions, :_machinename_eof_actions=
end
self._machinename_eof_actions = [
	0, 7, 7, 7, 7, 7, 0, 3
]

class << self
	attr_accessor :machinename_start
end
self.machinename_start = 1;
class << self
	attr_accessor :machinename_first_final
end
self.machinename_first_final = 6;
class << self
	attr_accessor :machinename_error
end
self.machinename_error = 0;

class << self
	attr_accessor :machinename_en_main
end
self.machinename_en_main = 1;


# line 55 "grammar.rl"
    # END RAGEL DATA

    @tokenstack = Array.new
    @stack = Array.new

    @types = Hash.new { |h,k| h[k] = [] }
    @edges = []
  end

  def parse(string)
    puts "Candidate: #{string}"
    data = string.unpack("c*")

    # BEGIN RAGEL INIT
    
# line 139 "grammar.rb"
begin
	p ||= 0
	pe ||= data.length
	cs = machinename_start
end

# line 70 "grammar.rl"
    # END RAGEL INIT

    begin 
      # BEGIN RAGEL EXEC 
      
# line 152 "grammar.rb"
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
	if p == pe
		_goto_level = _test_eof
		next
	end
	if cs == 0
		_goto_level = _out
		next
	end
	end
	if _goto_level <= _resume
	_keys = _machinename_key_offsets[cs]
	_trans = _machinename_index_offsets[cs]
	_klen = _machinename_single_lengths[cs]
	_break_match = false
	
	begin
	  if _klen > 0
	     _lower = _keys
	     _upper = _keys + _klen - 1

	     loop do
	        break if _upper < _lower
	        _mid = _lower + ( (_upper - _lower) >> 1 )

	        if data[p] < _machinename_trans_keys[_mid]
	           _upper = _mid - 1
	        elsif data[p] > _machinename_trans_keys[_mid]
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
	  _klen = _machinename_range_lengths[cs]
	  if _klen > 0
	     _lower = _keys
	     _upper = _keys + (_klen << 1) - 2
	     loop do
	        break if _upper < _lower
	        _mid = _lower + (((_upper-_lower) >> 1) & ~1)
	        if data[p] < _machinename_trans_keys[_mid]
	          _upper = _mid - 2
	        elsif data[p] > _machinename_trans_keys[_mid+1]
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
	_trans = _machinename_indicies[_trans]
	cs = _machinename_trans_targs[_trans]
	if _machinename_trans_actions[_trans] != 0
		_acts = _machinename_trans_actions[_trans]
		_nacts = _machinename_actions[_acts]
		_acts += 1
		while _nacts > 0
			_nacts -= 1
			_acts += 1
			case _machinename_actions[_acts - 1]
when 0 then
# line 6 "grammar.rl"
		begin

    @tokenstack.push(p)
    puts "Mark: #{self.line(string, p)}##{self.column(string, p)}"
  		end
# line 6 "grammar.rl"
when 2 then
# line 19 "grammar.rl"
		begin

    startpos = @tokenstack.pop
    endpos = p
    token = string[startpos + 1 .. endpos - 1] # Skip quotations

    # Parse escapes.
    token.gsub(/\\./) { |m| m[1,1] }
    puts "quotedstring: #{token}"
    @stack << token
  		end
# line 19 "grammar.rl"
when 3 then
# line 30 "grammar.rl"
		begin

    puts "current: #{string[@tokenstack.first .. p] rescue "???"}"
  		end
# line 30 "grammar.rl"
when 4 then
# line 42 "grammar.rl"
		begin
 
            # Compute line and column of the cursor (p)
            puts "Error at line #{self.line(string, p)}, column #{self.column(string, p)}: #{string[p .. -1].inspect}"
            # TODO(sissel): Note what we were expecting?
          		end
# line 42 "grammar.rl"
# line 271 "grammar.rb"
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
	p += 1
	if p != pe
		_goto_level = _resume
		next
	end
	end
	if _goto_level <= _test_eof
	if p == eof
	__acts = _machinename_eof_actions[cs]
	__nacts =  _machinename_actions[__acts]
	__acts += 1
	while __nacts > 0
		__nacts -= 1
		__acts += 1
		case _machinename_actions[__acts - 1]
when 1 then
# line 11 "grammar.rl"
		begin

    startpos = @tokenstack.pop
    endpos = p
    token = string[startpos ... endpos]
    puts "string: #{token}"
    @stack << token
  		end
# line 11 "grammar.rl"
when 4 then
# line 42 "grammar.rl"
		begin
 
            # Compute line and column of the cursor (p)
            puts "Error at line #{self.line(string, p)}, column #{self.column(string, p)}: #{string[p .. -1].inspect}"
            # TODO(sissel): Note what we were expecting?
          		end
# line 42 "grammar.rl"
# line 319 "grammar.rb"
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

# line 75 "grammar.rl"
      # END RAGEL EXEC
    rescue => e
      # Compute line and column of the cursor (p)
      raise e
    end

    if cs < self.machinename_first_final
      raise "Failed parsing: #{string}"
    end

    p(:cs => cs)
    return cs
  end # def parse

  def line(str, pos)
    return str[0 .. pos].count("\n") + 1
  end

  def column(str, pos)
    return str[0 .. pos].split("\n").last.length
  end
end # class LogStash::Config::Grammar

g = Grammar.new
puts "Result: #{ g.parse(%q{"hello\s world"}) }"
#p g.parse(%q{testing})
