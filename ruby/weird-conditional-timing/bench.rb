#!/usr/bin/env ruby
#

require "cabin"
require "benchmark"

LEVELS = Cabin::Mixins::Logger::LEVELS
DEBUG = LEVELS[:debug]

class B
  def initialize
    @buffer = ""
  end

  def level=(value)
    @level = value
  end
end

class Def < B
  def debug?
    LEVELS[@level] >= DEBUG
  end

  def debug(message)
    return unless debug?
    @buffer << message
  end
end

class DefCaller < B
  def debug?
    LEVELS[@level] >= DEBUG
  end

  def debug(message)
    return unless debug?
    caller[0] # just tell the ruby compiler we're gonna ask for the call stack.
    @buffer << message
  end
end

class DefineMethod < B
  m = :debug
  predicate = "#{m}?".to_sym

  define_method(predicate) do
    LEVELS[@level] >= DEBUG
  end

  define_method(m) do |message|
    return unless send(predicate)
    @buffer << message
  end

  def log(message, data)
  end
end

iterations = 1_000_000

debug_channel = Cabin::Channel.new
debug_channel.level = :debug
info_channel = Cabin::Channel.new
info_channel.level = :info
#objects = [debug_channel, info_channel, Def.new, DefineMethod.new]
#objects = [debug_channel, info_channel]
objects = [Def.new, DefineMethod.new, DefCaller.new]

msg = "ok"
Benchmark.bmbm(30) do |x|
  objects.each do |c|
    [:info, :debug].each do |level|
      c.level = level
      prefix = "#{c.class.name} #{level}:"
      x.report("#{prefix} debug? (#{c.debug?})") do
        iterations.times { c.debug? }
      end
      x.report("#{prefix} debug? && debug() (#{c.debug?})") do
        iterations.times { c.debug? && c.debug(msg) }
      end
      x.report("#{prefix} debug? && rand(100) (#{c.debug?})") do
        iterations.times { c.debug? && rand(100) }
      end
      x.report("#{prefix} debug? && nil (#{c.debug?})") do
        iterations.times { c.debug? && nil }
      end
      x.report("#{prefix} if debug? ... debug() (#{c.debug?})") do
        iterations.times { if c.debug? ; c.debug(msg); end }
      end

      if ENV["DEBUG"]
        x.report("#{prefix} debug() (#{c.debug?})") do
          iterations.times { c.debug(msg) }
        end
        x.report("#{prefix} nothing") do
          iterations.times { }
        end
        x.report("#{prefix} x = debug? (#{c.debug?})") do
          iterations.times { x = c.debug? }
        end
        x.report("#{prefix} false && debug() (#{c.debug?})") do
          iterations.times { false && c.debug(msg) }
        end
        x.report("#{prefix} true && debug() (#{c.debug?})") do
          iterations.times { true && c.debug(msg) }
        end
        x.report("#{prefix} value && debug() (#{c.debug?})") do
          value = c.debug?
          iterations.times { value && c.debug(msg) }
        end
        x.report("#{prefix} debug? and debug() (#{c.debug?})") do
          iterations.times { c.debug? and c.debug(msg) }
        end
        x.report("#{prefix} debug() if debug?(#{c.debug?})") do
          iterations.times { c.debug(msg) if c.debug? }
        end
      end
    end
  end
end

