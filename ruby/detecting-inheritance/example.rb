class Human
  def self.inherited(klass)
    puts "This class inherited from Human: #{klass.name}"
  end
end

class Jordan < Human
end
