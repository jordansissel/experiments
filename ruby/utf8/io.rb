
input_encoding = ARGV[0] || "UTF-8"
convert_to = "UTF-8"

str = $stdin.read
puts :read => str
str.force_encoding(input_encoding)
puts str.encode(convert_to, :invalid => :replace, :undef => :replace)
