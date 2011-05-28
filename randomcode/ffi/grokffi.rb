require "rubygems"
require "ffi"

# class for grok_t
# Attributes with '__' prefixes are not for your consumption; they
# are internal to libgrok.
class Grok < FFI::Struct
  # Use FFI to hook libgrok, expose so Grok class can use it.
  module CGrok
    extend FFI::Library
    ffi_lib "libgrok.so"
    attach_function :grok_new, [], :pointer
    attach_function :grok_compilen, [:pointer, :string, :int], :int
    attach_function :grok_pattern_add, [:pointer, :string, :int, :string, :int], :int
    attach_function :grok_patterns_import_from_file, [:pointer, :string], :int
    attach_function :grok_execn, [:pointer, :string, :int, :pointer], :int
  end

  include Grok::CGrok

  # This class (Grok) gives an OOP view on grok_t for grok.
  # To expose grok_t to FFI/Ruby, we need to describe the struct layout 
  # This is basically translated from grok.h
  layout :pattern, :string,
         :pattern_len, :int,
         :full_pattern, :string,
         :full_pattern_len, :int,
         :__patterns, :pointer, # TCTREE*, technically
         :__re, :pointer, # pcre*
         :__pcre_capture_vector, :pointer, # int*
         :__pcre_num_captures, :int,
         :__captures_by_id, :pointer, # TCTREE*
         :__captures_by_name, :pointer, # TCTREE*
         :__captures_by_subname, :pointer, # TCTREE*
         :__captures_by_capture_number, :pointer, # TCTREE*
         :__max_capture_num, :int,
         :pcre_errptr, :string,
         :pcre_erroffset, :int,
         :pcre_errno, :int,
         :logmask, :uint,
         :logdepth, :uint,
         :errstr, :string


  def initialize
    super(grok_new)
  end

  def compile(pattern)
    return grok_compilen(self, pattern, pattern.length)
  end

  def match?(text)
    return grok_execn(self, text, text.size, nil)
  end

  def add_patterns_from_file(path)
    return grok_patterns_import_from_file(self, path)
  end
end

# ---

file = File.new("/b/logs/access", "r")
iterations = 500000
require "thread"

queue = Queue.new
(1 .. iterations).each { queue << file.readline() }
start = Time.now

threads = 1.upto(4).collect do
  Thread.new  do
    grok = Grok.new
    #grok[:logmask] = (1<<31)-1 # log everything
    pattern = "%{COMBINEDAPACHELOG}"
    grok.add_patterns_from_file("/home/jls/projects/grok/patterns/base")
    compiled = grok.compile(pattern)
    if compiled != 0
      $stderr.puts "Error compiling '#{pattern}': #{grok[:errstr]}"
    end

    while true
      break if queue.empty?
      line = queue.pop
      ret = grok.match?(line)
    end
  end # Thread.new
end # 1..4

threads.each { |t| t.join }
duration = Time.now - start
p [duration, iterations / duration]

