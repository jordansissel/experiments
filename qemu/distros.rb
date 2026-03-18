require "yaml"

module CloudInit
  def default
    {
      users: [
        "default",
        {
          name: "dev",
          groups: "sudo",
          shell: "/bin/bash",
          "ssh-authorized-keys": %x(ssh-add -L).split("\n"),
          sudo: "ALL=(ALL) NOPASSWD:ALL",
        }
      ],
      chpasswd: {
        users: [
          { name: "dev", password: "dev", type: "text" }
        ],
        expire: false,
      },
      ssh_pwauth: true,
      package_update: true,
      package_ugprade: true,
      power_state: {
          delay: "now",
          mode: "poweroff",
          condition: true
      }
    }
  end

  def to_yaml
    default
    .merge(respond_to?(:misc) ? misc : {})
    .merge(respond_to?(:packages) ? { packages: packages } : {})
    .merge(respond_to?(:runcmd) ? { runcmd: runcmd } : {})
    .to_yaml(stringify_names: true)
  end

  def to_cloud_config
    return [ "#cloud-config", to_yaml ].join("\n")
  end
end

module Ubuntu; end

class Ubuntu::Noble
  include CloudInit

  def url
    "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
  end

  def packages
    [ "qemu-guest-agent", "gdm", "openssh-server" ]
  end

  def runcmd
    [
      "systemctl enable ssh",
      "systemctl enable gdm",
      "systemctl disable systemd-networkd-wait-online.service",
      "systemctl set-default graphical.target",
    ]
  end

  def misc
    {
      "apt": {
        "proxy": "http://192.168.12.67:3142",
        "conf": "APT::Install-Recommends '0'; APT::Install-Suggests '0';"
      },
    }
  end

end

class Ubuntu::Noble::GNOME < Ubuntu::Noble
  def packages
    super + [ "ubuntu-gnome-desktop" ]
  end

  def write_files
    [
      {
        "content": "[daemon]\nAutomaticLoginEnable=True\nAutomaticLogin=dev\n",
        "path": "/etc/gdm/custom.conf"
      }
    ]
  end
end

class Ubuntu::Noble::KDE < Ubuntu::Noble
  def packages
    super + [ "kde-plasma-desktop", "kubuntu-settings-desktop" ]
  end

  def write_files
    super + [
      {
        "content": "[daemon]\nAutomaticLoginEnable=True\nAutomaticLogin=dev\n",
        "path": "/etc/gdm/custom.conf"
      },
      {
        "content": "[User]\nSession=plasma\n",
        "path": "/var/lib/AccountService/users/dev"
      },
    ]
  end
end

module Fedora; end

class Fedora::V43
  include CloudInit

  def url
    "https://download.fedoraproject.org/pub/fedora/linux/releases/43/Cloud/x86_64/images/Fedora-Cloud-Base-Generic-43-1.6.x86_64.qcow2"
  end

  def packages
    [
      "qemu-guest-agent",
      "gdm",
      "openssh-server",
      "ptyxis",
    ]
  end

  def runcmd
    [
      "systemctl enable ssh",
      "systemctl enable gdm",
      "systemctl set-default graphical.target",
      "systemctl disable systemd-networkd-wait-online.service",
      #"sed -i -e 's/^metalink=/#&/; s/^#baseurl=/baseurl=/' /etc/yum.repos.d/*.repo"
      #rpmfusion-nonfree-updates.repo:metalink=https://mirrors.rpmfusion.org/metalink?repo=nonfree-fedora-updates-released-$releasever&arch=$basearch
#rpmfusion-nonfree-updates.repo:#baseurl=http://download1.rpmfusion.org/nonfree/fedora/updates/$releasever/$basearch/debug/
    ]
  end

  def write_files 
    [
      {
        "content": "# Comment out until my proxy does ssl?\n#[main]\n#proxy=http://192.168.12.67:3142",
        "path": "/etc/dnf/libdnf5.conf.d/10-proxy.conf"
      },
      {
        "content": "[daemon]\nAutomaticLoginEnable=True\nAutomaticLogin=dev\n",
        "path": "/etc/gdm/custom.conf"
      }
    ]
  end
end

class Fedora::V43::GNOME < Fedora::V43

  def packages
    super + [
      "gnome-desktop4",
    ]
  end

  def write_files 
    [
      {
        "content": "[User]\nSession=plasma\n",
        "path": "/var/lib/AccountService/users/dev"
      },
    ]
  end
end

class Fedora::V43::KDE < Fedora::V43

  def packages
    super + [
      "plasma-desktop"
    ]
  end

  def write_files 
    [
      {
        "content": "[User]\nSession=plasma\n",
        "path": "/var/lib/AccountService/users/dev"
      },
    ]
  end
end

class Fedora::V43::COSMIC < Fedora::V43

  def packages
    super + [
      "cosmic-session"
    ]
  end

  def write_files 
    [
      {
        "content": "[User]\nSession=cosmic\n",
        "path": "/var/lib/AccountService/users/dev"
      },
    ]
  end
end

if __FILE__ == $0
  distros = {
    "fedora-43-cosmic" =>  Fedora::V43::COSMIC,
    "fedora-43-kde" => Fedora::V43::KDE,
    "fedora-43-gnome" => Fedora::V43::GNOME,
    "ubuntu-noble-gnome" => Ubuntu::Noble::GNOME,
    "ubuntu-noble-kde" => Ubuntu::Noble::KDE,
  }

  if ARGV[0] == "--url"
    name = ARGV[1]
    method = :url
  else
    name = ARGV[0]
    method = :to_cloud_config
  end

  if distros.has_key?(name)
    puts distros[name].new.send(method)
  else
    $stderr.puts "Unknkown distro target: #{name.inspect}"
    $stderr.puts distros.keys.sort.inspect
    exit 1
  end
end
