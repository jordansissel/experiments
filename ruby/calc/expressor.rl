%%{ 
machine expressor ;

integer = '-'? [0-9]+ ;
real = '-'? [0-9]+ ( '.' [0-9]+ ) ;
identifier = [@A-Za-z_][A-Za-z_0-9]* ;
operator = '(' | ')' | '-' | '+' | '*' | '/' | '%' | '^' | '.' | ',';
token = (integer | real | identifier) ;

main := |*
  identifier => { emit :identifier, data[ts...te].pack("C*") } ;
  real => { emit :real, data[ts...te].pack("C*") } ;
  integer => { emit :integer, data[ts...te].pack("C*") } ;
  operator => { emit :operator, data[ts...te].pack("C*") } ;
  space ;
*| ;
}%%

class Expressor
  SYMBOLS = {
    "(" => :OPENPAREN,
    ")" => :CLOSEPAREN,
    "-" => :MINUS,
    "+" => :PLUS,
    "/" => :DIVIDE,
    "*" => :MULTIPLY,
    "%" => :MODULUS,
    "^" => :EXPONENT,
    "," => :COMMA,
  }

  def initialize
    # WRITE DATA START
    %% write data ;
    # WRITE DATA END
  end

  def parse(string)
    data = string.unpack("c*")
    eof = data.length
    %% write init ;
    %% write exec ;
  end
end
