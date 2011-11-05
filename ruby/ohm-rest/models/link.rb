class Link < Model
  attribute :model
  attribute :object_id

  index :model
  index :object_id

  def validate
    assert_present :model
    assert_present :object_id
  end # def validate

  def to_hash
    super.merge(:model => model, :object_id => object_id)
  end # def to_hash

end # class Link

