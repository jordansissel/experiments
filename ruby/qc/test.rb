require "celluloid"

module Quality
  class Failure < StandardError; end
end

module Quality::Registry
  def inherited(klass)
    registry << klass
  end
  def each(&block)
    return registry.each(&block)
  end
  def registry
    return @registry ||= []
  end
end

class Quality::Control
  extend Quality::Registry

  def inspect
    return self.class.to_s
  end

  def before
    nil
  end
  def after
    nil
  end

  def self.before(&block)
    define_method(:before) do
      super()
      block.call
    end
  end

  def self.after(&block)
    define_method(:after) do
      block.call
      super()
    end
  end

  def self.test(name="", &block)
    @tests ||= []
    @tests << [[self.name, name].join(" "), block]
  end

  def self.tests
    return @tests || []
  end

end

class Quality::Worker
  include Celluloid

  def initialize(suite)
    @suite = suite
  end

  def exec(qc, block)
    begin
      obj = qc.new
      obj.before
      result = obj.instance_eval(&block)
      obj.after
      return [:return, result]
    rescue => exception
      return [:exception, exception]
    end
  end
end

class Quality::Suite
  include Celluloid

  def initialize
    @executor = Quality::Worker.pool(:size => 5, :args => [Celluloid::Actor.current])
    @futures = []
  end

  def add(qc)
    qc.tests.each do |name, block|
      @futures << [name, @executor.future.exec(qc, block)]
    end

    # Get subclasses, too
    qc.each do |qc|
      add(qc)
    end
  end

  def run(enumerable)
    enumerable.each do |qc|
      add(qc)
    end

    @futures.each do |name, f|
      # TODO(sissel): see if we can't get exceptions from an actor more
      # easily than catching and returing [:exception, the_exception_object]
      # Worst case, let's wrap it up in a result object.

      # TODO(sissel): Something needs to collect the results, right?
      # Maybe this method should yield results
      rt, value = f.value
      if rt == :exception
        puts "Failure: #{name.inspect}: #{value}"
        #puts value
        puts value.backtrace
      end
    end
  end
end

module Quality::Words
  def describe(text=nil, opts=nil, &block)
    if self.is_a?(Class) && self.ancestors.include?(Quality::Control)
      parent = self
    else
      parent = Quality::Control
    end

    klass = Class.new(parent, &block)
    klass.define_singleton_method(:to_s) do
      return (parent != Quality::Control ? (super()+" ") : "") + (text || klass.name || "???")
    end
    return klass
  end
end

include Quality::Words
