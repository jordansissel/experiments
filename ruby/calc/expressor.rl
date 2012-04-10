%%{ 
machine expressor ;

integer = '-'? [0-9]+ ;
real = '-'? [0-9]+ ( '.' [0-9]+ ) ;
identifier = [@A-Za-z_][A-Za-z_0-9]* ;
operator = '-' | '+' | '*' | '/' | '%' | '^' | '.' ;

main := |*
  integer => { 
    emit :rvalue, data[ts...te].pack("C*").to_i
  } ;
  real => {
    emit :rvalue, data[ts...te].pack("C*").to_f
  } ;
  identifier => {
    emit :identifier, data[ts...te].pack("C*")
  } ;
  operator => {
    emit :operator, data[ts...te].pack("C*")
  } ;
  space ;
*| ;
}%%

def emit(args)
  puts(args.inspect)
end

class Expressor
  def initialize
    # WRITE DATA START
    %% write data ;
    # WRITE DATA END
  end

  def parse(string)
    data = string.unpack("c*")
    %% write init ;
    eof = data.length
    %% write exec ;
  end
end
