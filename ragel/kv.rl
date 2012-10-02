%%{
  machine kv;

  action mark {
    @tokenstack.push(p)
    puts "Mark: #{self.line(string, p)}##{self.column(string, p)}"
  }

  action stack_numeric {
    startpos = @tokenstack.pop
    endpos = p
    token = string[startpos ... endpos]
    #puts "numeric: #{token}"
    #puts "numeric?: #{string[startpos,50]}"
    #puts [startpos, endpos].join(",")
    @stack << token.to_i
  }

  action stack_string {
    startpos = @tokenstack.pop
    endpos = p
    #puts "range: #{startpos} -> #{endpos}"
    token = string[startpos ... endpos]
    #puts "string: #{token}"
    @stack << token
  }

  action stack_quoted_string {
    startpos = @tokenstack.pop
    endpos = p
    token = string[startpos + 1 ... endpos - 1] # Skip quotations

    # Parse escapes.
    token.gsub(/\\./) { |m| m[1,1] }
    #puts "quotedstring: #{token}"
    @stack << token
  }

  ws = ([ \t\n] )** ;

  # TODO(sissel): Support floating point values?
  numeric = ( ("+" | "-")?  [0-9] :>> [0-9]** ) >mark %stack_numeric;
  quoted_string = ( 
    ( "\"" ( ( (any - [\\"\n]) | "\\" any )* ) "\"" )
    | ( "'" ( ( (any - [\\'\n]) | "\\" any )* ) "'" ) 
  ) >mark %stack_quoted_string ;
  naked_string = ( [A-Za-z_] :>> [A-Za-z0-9_]* ) >mark %stack_string ;
  string = ( quoted_string | naked_string ) ;

  nonspace = (/\S/ /\S/**) >mark %stack_string ;

  kv = naked_string '=' (string | numeric | anythingbutspace) ;
  #kv = naked_string '=' naked_string ;
  main := (kv ws+)+ %{ puts "END" }
          $err { 
            # Compute line and column of the cursor (p)
            $stderr.puts "Error at line #{self.line(string, p)}, column #{self.column(string, p)}: #{string[p .. -1].inspect}"
            # TODO(sissel): Note what we were expecting?
          } ;
}%%

class KV
  attr_accessor :eof

  def initialize
    # BEGIN RAGEL DATA
    %% write data;
    # END RAGEL DATA

    @tokenstack = Array.new
    @stack = Array.new
  end

  def parse(string)
    # TODO(sissel): Due to a bug in my parser, we need one trailing whitespace
    # at the end of the string. I'll fix this later.
    #string += "\n"

    data = string.unpack("c*")
    eof = string.size

    # BEGIN RAGEL INIT
    %% write init;
    # END RAGEL INIT

    begin 
      # BEGIN RAGEL EXEC 
      %% write exec;
      # END RAGEL EXEC
    rescue => e
      # Compute line and column of the cursor (p)
      raise e
    end

    if cs < self.kv_first_final
      $stderr.puts "Error at line #{self.line(string, p)}, column #{self.column(string, p)}: #{string[p .. -1].inspect}"
      raise "Invalid Configuration. Check syntax of config file."
    end
    
    puts @stack.inspect
    puts @tokenstack.inspect
    return cs
  end # def parse

  def line(str, pos)
    return str[0 .. pos].count("\n") + 1
  end

  def column(str, pos)
    return str[0 .. pos].split("\n").last.length
  end
end # class KV

KV.new.parse(ARGV[0])
