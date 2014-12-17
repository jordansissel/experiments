require "pry"

Dir.glob("./plugins/*.jar") { |jar| require jar }

def visit(astnode, &block)
  visitor = Class.new(org.eclipse.jdt.core.dom.ASTVisitor) do
    define_method(:postVisit) do |node|
      block.call(node)
    end
  end.new
  astnode.accept(visitor)
end

def generate_patterns(files)
  files.each do |file|
    parser = org.eclipse.jdt.core.dom.ASTParser.newParser(org.eclipse.jdt.core.dom.AST::JLS4)
    parser.setSource(File.read(file).to_java.toCharArray())
    cu = parser.createAST(nil)
    #cu.accept(LogScanner.new)
    
    patterns = []
    visit(cu) do |node|
      # Find all method invocations that look like logger.whatever(
      if node.is_a?(org.eclipse.jdt.core.dom.MethodInvocation) && node.to_s =~ /^logger\.[A-Za-z0-9_]+\(/
        children = []

        annotation = "#{file} byte #{node.getStartPosition}-#{node.getLength}"

        # Collect immediate child AST nodes
        visit(node) do |child|
          children << child if child.parent == node
        end
        logger, method, format, *args = children
        if children.length < 3
          $stderr.puts "# Unexpected call (no arguments): #{node}"
          $stderr.puts "#   -> #{annotation}"
          next
        end

        if !format.is_a?(org.eclipse.jdt.core.dom.StringLiteral)
          $stderr.puts "# First argument isn't a string, can't process: #{node}"
          $stderr.puts "#   -> #{annotation}"
          next
        end

        #puts "#{logger}.#{method}(#{format}, #{args.join(", ")})"
        
        fields = args.collect { |a| a.to_s.gsub(/[+()]/,"").gsub(/\s+.*$/, "") }
        pattern = Regexp.escape(format.to_s).gsub("\\ ", " ").gsub("\\{\\}") do |x|
          "%{DATA:#{fields.shift}}"
        end
        #puts "\[%{TIMESTAMP_ISO8601}\]\[%{WORD:loglevel}\]\[%{NOTSPACE:component} *\] \[(?<node_name>[^\]]+)]
        #binding.pry if node.to_s =~ /timeout notification from cluster/
      end
    end

    puts patterns.sort_by { |s| s.bytesize }.join(",\n")
  end
end # def generate_patterns

puts <<-HURRAY
input { 
  stdin { }
}
output { 
  stdout {
    codec => rubydebug
  }
}
HURRAY

puts "filter {"
puts "  grok {"
puts "    match => { \"message\" => ["

files = Dir.glob(File.join(ARGV[0], "**", "*.java"))
generate_patterns(files)

puts "    ] }"
puts "  }"
puts "}"
