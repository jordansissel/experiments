Puppet::Type.newtype(:foo) do
  @doc = "Whoa"

  ensurable

  newproperty(:owner) do
    desc "He's the boss."

    validate do |value|
      if value !~ /Tony Danza/
        raise ArgumentError, "Only Tony Danza, not #{value}, is the boss." 
      end
    end # validate
  end # property :owner

  # get 'owner' with should(:owner)
end
