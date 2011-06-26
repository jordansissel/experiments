
#line 1 "grammar.rl"
require "rubygems"


#line 44 "grammar.rl"


class Grammar
  attr_accessor :eof

  def initialize
    # BEGIN RAGEL DATA
    
#line 16 "grammar.c"
static const char _logstash_config_actions[] = {
	0, 1, 0, 1, 1, 1, 2, 1, 
	3
};

static const char _logstash_config_key_offsets[] = {
	0, 0, 2, 5, 5, 8, 8
};

static const char _logstash_config_trans_keys[] = {
	34, 39, 10, 34, 92, 10, 39, 92, 
	0
};

static const char _logstash_config_single_lengths[] = {
	0, 2, 3, 0, 3, 0, 0
};

static const char _logstash_config_range_lengths[] = {
	0, 0, 0, 0, 0, 0, 0
};

static const char _logstash_config_index_offsets[] = {
	0, 0, 3, 7, 8, 12, 13
};

static const char _logstash_config_trans_targs[] = {
	2, 4, 0, 0, 6, 3, 2, 2, 
	0, 6, 5, 4, 4, 0, 0
};

static const char _logstash_config_trans_actions[] = {
	1, 1, 7, 7, 5, 0, 0, 0, 
	7, 0, 0, 0, 0, 7, 0
};

static const char _logstash_config_eof_actions[] = {
	0, 7, 7, 7, 7, 7, 3
};

static const int logstash_config_start = 1;
static const int logstash_config_first_final = 6;
static const int logstash_config_error = 0;

static const int logstash_config_en_main = 1;


#line 52 "grammar.rl"
    # END RAGEL DATA

    @tokenstack = Array.new
    @stack = Array.new

    @types = Hash.new { |h,k| h[k] = [] }
    @edges = []
  end

  def parse(string)
    data = string.unpack("c*")

    # BEGIN RAGEL INIT
    
#line 79 "grammar.c"
	{
	cs = logstash_config_start;
	}

#line 66 "grammar.rl"
    # END RAGEL INIT

    begin 
      # BEGIN RAGEL EXEC 
      
#line 90 "grammar.c"
	{
	int _klen;
	unsigned int _trans;
	const char *_acts;
	unsigned int _nacts;
	const char *_keys;

	if ( p == pe )
		goto _test_eof;
	if ( cs == 0 )
		goto _out;
_resume:
	_keys = _logstash_config_trans_keys + _logstash_config_key_offsets[cs];
	_trans = _logstash_config_index_offsets[cs];

	_klen = _logstash_config_single_lengths[cs];
	if ( _klen > 0 ) {
		const char *_lower = _keys;
		const char *_mid;
		const char *_upper = _keys + _klen - 1;
		while (1) {
			if ( _upper < _lower )
				break;

			_mid = _lower + ((_upper-_lower) >> 1);
			if ( (*p) < *_mid )
				_upper = _mid - 1;
			else if ( (*p) > *_mid )
				_lower = _mid + 1;
			else {
				_trans += (_mid - _keys);
				goto _match;
			}
		}
		_keys += _klen;
		_trans += _klen;
	}

	_klen = _logstash_config_range_lengths[cs];
	if ( _klen > 0 ) {
		const char *_lower = _keys;
		const char *_mid;
		const char *_upper = _keys + (_klen<<1) - 2;
		while (1) {
			if ( _upper < _lower )
				break;

			_mid = _lower + (((_upper-_lower) >> 1) & ~1);
			if ( (*p) < _mid[0] )
				_upper = _mid - 2;
			else if ( (*p) > _mid[1] )
				_lower = _mid + 2;
			else {
				_trans += ((_mid - _keys)>>1);
				goto _match;
			}
		}
		_trans += _klen;
	}

_match:
	cs = _logstash_config_trans_targs[_trans];

	if ( _logstash_config_trans_actions[_trans] == 0 )
		goto _again;

	_acts = _logstash_config_actions + _logstash_config_trans_actions[_trans];
	_nacts = (unsigned int) *_acts++;
	while ( _nacts-- > 0 )
	{
		switch ( *_acts++ )
		{
	case 0:
#line 6 "grammar.rl"
	{
    @tokenstack.push(p)
    puts "Mark: #{self.line(string, p)}##{self.column(string, p)}"
  }
	break;
	case 2:
#line 32 "grammar.rl"
	{ puts "Got #{string[p,1]}" }
	break;
	case 3:
#line 39 "grammar.rl"
	{ 
            # Compute line and column of the cursor (p)
            puts "Error at line #{self.line(string, p)}, column #{self.column(string, p)}: #{string[p .. -1].inspect}"
            # TODO(sissel): Note what we were expecting?
          }
	break;
#line 182 "grammar.c"
		}
	}

_again:
	if ( cs == 0 )
		goto _out;
	if ( ++p != pe )
		goto _resume;
	_test_eof: {}
	if ( p == eof )
	{
	const char *__acts = _logstash_config_actions + _logstash_config_eof_actions[cs];
	unsigned int __nacts = (unsigned int) *__acts++;
	while ( __nacts-- > 0 ) {
		switch ( *__acts++ ) {
	case 1:
#line 20 "grammar.rl"
	{
    startpos = @tokenstack.pop
    endpos = p
    token = string[startpos + 1 ... endpos - 1] # Skip quotations

    # Parse escapes.
    token.gsub(/\\./) { |m| return m[1,1] }
    #puts "quotedstring: #{token}"
    @stack << token
  }
	break;
	case 3:
#line 39 "grammar.rl"
	{ 
            # Compute line and column of the cursor (p)
            puts "Error at line #{self.line(string, p)}, column #{self.column(string, p)}: #{string[p .. -1].inspect}"
            # TODO(sissel): Note what we were expecting?
          }
	break;
#line 219 "grammar.c"
		}
	}
	}

	_out: {}
	}

#line 71 "grammar.rl"
      # END RAGEL EXEC
    rescue => e
      # Compute line and column of the cursor (p)
      raise e
    end

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
p g.parse(%q{"hello world"})
