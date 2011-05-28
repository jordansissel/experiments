Puppet::Type.newtype("swedishchef_package") do
  @doc = "Whoa"

  ensurable

  newparam(:name) do
    desc "The package name"
    isnamevar
  end # property :owner
end
