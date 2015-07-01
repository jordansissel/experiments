require "buftok"

class FileChanges
  include Enumerable

  attr_accessor :old_name
  attr_accessor :new_name

  def initialize
    @hunks = []
  end

  def add_hunk(hunk)
    @hunks << hunk
  end

  def current_hunk
    @hunks.last
  end

  def each(&block)
    @hunks.each(&block)
  end
end

class Hunk
  include Enumerable
  attr_accessor :old_line
  attr_accessor :old_height
  attr_accessor :new_line
  attr_accessor :new_height
  attr_accessor :description

  def initialize(old_line, old_height, new_line, new_height, description=nil)
    @actions = []
    @old_line = old_line
    @old_height = old_height
    @new_line = new_line
    @new_height = new_height
    @description = description
  end

  def stay(line)
    @actions << Action::Stay.new(line)
  end

  def add(line)
    @actions << Action::Add.new(line)
  end

  def remove(line)
    @actions << Action::Remove.new(line)
  end

  def each(&block)
    old_line = @old_line
    new_line = @new_line
    # The math here may not be correct. I was tired when I wrote it.
    @actions.each do |action|
      case action
      when Action::Stay
        old_line += 1
        new_line += 1
      when Action::Add
        new_line += 1
      when Action::Remove
        old_line += 1
      end
      block.call(action, old_line, new_line)
    end
  end
end

module Action
  class Base
    def initialize(line)
      @content = line
    end
  end 
  class Stay < Base; end
  class Add < Base; end
  class Remove < Base; end
end

class DiffParser
  include Enumerable

  def initialize
    @buftok = BufferedTokenizer.new
    @state = :description
    @description = ""
    @files = []
  end

  def each(&block)
    @files.each(&block)
  end

  def current_file
    @files.last
  end

  def current_hunk
    current_file.current_hunk
  end

  def feed(data)
    @buftok.extract(data).each do |line|
      handle(line)
    end
  end

  def transition(new_state)
    @state = new_state
  end

  def handle(line)
    send(@state, line)
  end

  def description(line)
    case line
    when /^--- /
      transition(:file_header)
      handle(line)
    else
      @description << line
    end
  end

  def file_header(line)
    @files << FileChanges.new
    case line
    when /^--- /
      current_file.old_name = line.split(" ", 2).last
      transition(:file_header2)
    else
      raise UnexpectedLine, line
    end
  end

  def file_header2(line)
    case line
    when /^\+\+\+ /
      current_file.new_name = line.split(" ", 2).last
      transition(:hunk_header)
    else
      raise UnexpectedLine, line
    end
  end

  HUNK_HEADER_RE = /^@@ -(?<old_line>\d+),(?<old_height>\d+) \+(?<new_line>\d+),(?<new_height>\d+) @@(?: (?<hunk_description>.*))?/
  def hunk_header(line) 
    m = HUNK_HEADER_RE.match(line)
    raise UnexpectedLine, line unless m

    hunk = Hunk.new(m["old_line"].to_i, m["old_height"].to_i,
                    m["new_line"].to_i, m["new_height"].to_i,
                    m["hunk_description"])
    current_file.add_hunk(hunk)

    transition(:hunk_body)
  end

  def hunk_body(line)
    case line
    when /^ / # same line in both files
      current_hunk.stay(line[1..-1])
    when /^-/ # line in old file but not new file
      current_hunk.remove(line[1..-1])
    when /^\+/ # line in new file but not old file
      current_hunk.add(line[1..-1])
    when /^@@ / # new hunk section
      transition(:hunk_header)
      handle(line)
    when /^--- / # new file section
      transition(:file_header)
    else
      raise UnexpectedLine, line
    end
  end
end
