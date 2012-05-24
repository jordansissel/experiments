# A pipeline has
# * inputs (the start of a pipeline, aka faucet, source, reader)
# * filters (a pipeline processor, aka processor, decorator)
# * outputs (the end of a pipeline, aka sink, drain, writer))

# A pipeline.
#
# Inputs are unordered.
# Filters are ordered.
# Outputs are unordered.
class Pipeline
  def initialize
  end # def initialize
end # class Pipeline
