# TODO(sissel): Document
class Patch
  attr_reader hunks

  # A hunk is a piece of a patch that represents a single section of a file's
  # changes. One file can have many hunks.
  class Hunk
    attr_reader original_range
    attr_reader new_range
    attr_reader heading
  end

  # Apply a patch
end
