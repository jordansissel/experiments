require "rubygems"
require "awesome_print"

%%{
  machine mpf;

  action foo {
    puts "OK"
  }

  ws = ([ \t\n])* ;
  arrow = "->" | "<-" | "~>" | "<~" ;
  uppercase_name = [A-Z][A-Za-z0-9:]* ;
  quoted_string = "\"" ( (any - "\"") | "\\" any)* "\"" |
                  "'" ( (any - "'") | "\\" any)* "'" ;
  #naked_string = alnum+ ;
  naked_string = [A-Za-z0-9:+\-\[\]] ;
  string = quoted_string | naked_string ;
  type_name = [A-Za-z0-9_:]+ ;
  param_name = [A-Za-z0-9_]+ ;
  param_value = string ;

  parameter = param_name ws "=>" ws param_value
  parameters = parameter ( ws "," ws parameter )* ;

  reference = uppercase_name "[" string "]" ;
  edge = reference ws arrow ws reference ;
  name = [A-Za-z0-9]+ ;
  
  resource_entry = name ws ":" ws parameters ws ";" ;
  resource_entries = resource_entry ( ws resource_entry )* ;

  resource = type_name ws "{" ws resource_entries ws "}" > foo ;
  statement = (ws (resource | edge) )+ ;

  main := ( statement )
          0 @{ puts "Failed" }
          $err { puts "Error" } ;
}%%

class MPF
  attr_accessor :eof
  def parse(string)
    %% write data;

    data = string.unpack("c*")

    %% write init;
    %% write exec;
  end

end # class MPF

def parse(string)
  MPF.new.parse(string)
end

parse("
  foo { 
    test: 
      fizzle => 'bar'; 
    foo:
      bar => 'baz';
  }

  Foo["test"] -> Foo["foo"]
")
