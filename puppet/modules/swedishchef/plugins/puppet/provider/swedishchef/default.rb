Puppet::Type.type(:foo).provide(:default) do
  desc "Whatever"

  def create
    puts "Create"
  end

  def destroy
    puts "Destroy"
  end

  def exists?
    puts "Exists?"
    return true
  end
end # Puppet::Type :foo
