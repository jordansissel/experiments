# I tried namespacing this like 'swedischef::package' but puppet has some
# trouble with that and reports: 
#   Could not autoload swedishchef::package: wrong constant name
#   Swedishchef::package
#

require "rubygems"

Puppet::Type.type("swedishchef_package").provide(:default) do
  desc "Whatever"

  def self.setup_chef
    require "chef"
    require "chef/client"
    require "chef/run_context"

    Chef::Config[:solo] = true
    Chef::Config[:log_level] = :info
    Chef::Log.level(:info)

    notice("Initializing chef...")
    chef_client = Chef::Client.new
    chef_client.run_ohai
    chef_client.build_node
    @@chef_context = Chef::RunContext.new(chef_client.node,
                                          Chef::CookbookCollection.new)

  end # def self.setup_chef

  setup_chef

  def create
    chefpackage = Chef::Resource::Package.new(resource[:name], @@chef_context)
    chefpackage.version = resource[:ensure] if resource[:ensure] != :present
    chefpackage.run_action(:install)
  end # def create

  def destroy
    notice("destroyed.")
  end

  def exists?
    # Fake exists? so we always run chef.
    # Return 'true' if ensure => absent (to force 'destroy')
    # Return 'false' otherwise (to force 'create')
    return @resource.should(:ensure) == :absent
  end

end # Puppet::Type :foo
