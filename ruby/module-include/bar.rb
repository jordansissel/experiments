

module Rands
  def self.included( klass )
    # Modify existing instances
    #ObjectSpace.each_object( klass ){ |inst|
      #inst.initialize_rands
    #}

    # Replace the initialization with your own
    klass.class_eval{
      # Beware name clashes
      alias_method :init_pre_rand, :initialize
      def initialize( *args )
        init_pre_rand( *args )
        initialize_rands
      end
    }
  end

  def initialize_rands
    @foo = "%.2f" % rand
  end
end

class Foo
  include Rands
  def initialize( id )
    @id = id
  end
end

f1 = Foo.new( 1 )
f2 = Foo.new( 2 )
class Foo
end
f3 = Foo.new( 3 )
f4 = Foo.new( 4 )

p f1, f2, f3, f4

