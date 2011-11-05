require "./models/mixins/linkable"

class Host < Model
  include Linkable
  attribute :state

  def validate
    p "Validate #{self}"
    assert_present :state
  end # def validate

  def to_hash
    super.merge(:state => state, :links => links.collect { |l| l.to_hash } )
  end # def validate
end # class Host

