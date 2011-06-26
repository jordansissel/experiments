require "rubygems"

%%{
  machine machinename;

  action mark {
    @tokenstack.push(p)
    puts "Mark: #{self.line(string, p)}##{self.column(string, p)}"
  }

  action stack_string {
    startpos = @tokenstack.pop
    endpos = p
    token = string[startpos ... endpos]
    puts "string: #{token}"
    @stack << token
  }

  action stack_quoted_string {
    startpos = @tokenstack.pop
    endpos = p
    token = string[startpos + 1 .. endpos - 1] # Skip quotations

    # Parse escapes.
    token.gsub(/\\./) { |m| m[1,1] }
    puts "quotedstring: #{token}"
    @stack << token
  }

  action debug {
    puts "current: #{string[@tokenstack.first .. p] rescue "???"}"
  }

  quoted_string = ( 
    ( ["] ( ( (any - [\\"\n]) | "\\" any )** ) ["] ) |
    ( ['] ( ( (any - [\\'\n]) | "\\" any )** ) ['] ) 
  ) >mark @stack_quoted_string $debug ;
  naked_string = ( [A-Za-z_] :>> [A-Za-z0-9_]* ) >mark %stack_string ;
  string = ( quoted_string | naked_string ) ;

  main := ( string )
          $err { 
            # Compute line and column of the cursor (p)
            puts "Error at line #{self.line(string, p)}, column #{self.column(string, p)}: #{string[p .. -1].inspect}"
            # TODO(sissel): Note what we were expecting?
          } ;
}%%

class Grammar
  attr_accessor :eof

  def initialize
    # BEGIN RAGEL DATA
    %% write data;
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
