# prospect, harvest, emit

module File
  class Prospector
    # scan for files, emit a signal when we find new ones.
  end

  class Harvester
    # seek to desired start position
    # read chunks and emit
    # on EOF, sleep
  end
end
