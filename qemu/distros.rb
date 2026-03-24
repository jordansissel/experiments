require "yaml"

module CloudInit
  def default
    {
      users: [
        "default",
        {
          name: default_user,
          groups: "sudo",
          shell: "/bin/bash",
          "ssh-authorized-keys": %x(ssh-add -L).split("\n"),
          sudo: "ALL=(ALL) NOPASSWD:ALL",
        }
      ],
      chpasswd: {
        users: [
          { name: default_user, password: "dev", type: "text" }
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
    .merge(respond_to?(:write_files) ? { write_files: write_files } : {})
    .to_yaml(stringify_names: true)
  end

  def to_cloud_config
    return [ "#cloud-config", to_yaml ].join("\n")
  end

  def default_user
    "dev"
  end

  def default_gdm_session(session_name)
    {
      "content": "[User]\nSession=#{session_name}\n",
      "path": "/var/lib/AccountService/users/#{default_user}"
    }
  end

  def automatic_login
    if self.class.ancestors.include?(Ubuntu)
      path = "/etc/gdm3/custom.conf"
    else
      path = "/etc/gdm/custom.conf"
    end
    {
      "content": "[daemon]\nAutomaticLoginEnable=True\nAutomaticLogin=#{default_user}\n",
      "path": path
    }
  end
end

class Ubuntu
  include CloudInit
end

class Ubuntu::Noble < Ubuntu
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

  def write_files
    []
  end

end

class Ubuntu::Noble::GNOME < Ubuntu::Noble
  def packages
    super + [ "ubuntu-gnome-desktop" ]
  end

  def write_files
    super + [
      automatic_login 
    ]
  end
end

class Ubuntu::Noble::KDE < Ubuntu::Noble
  def packages
    super + [ "kde-plasma-desktop", "kubuntu-settings-desktop" ]
  end

  def write_files
    super + [
      automatic_login,
      default_gdm_session("plasma"),
    ]
  end
end

class Fedora
  include CloudInit
end

class Fedora::V43 < Fedora
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
    ]
  end

  def write_files 
    [
      #{
        #"content": "# Comment out until my proxy does ssl?\n#[main]\n#proxy=http://192.168.12.67:3142",
        #"path": "/etc/dnf/libdnf5.conf.d/10-proxy.conf"
      #},
      automatic_login
    ]
  end
end

class Fedora::V43::GNOME < Fedora::V43

  def packages
    super + [
      "gnome-desktop4",
    ]
  end

  def runcmd
    super + [
      "dnf remove -y gnome-tour"
    ]
  end

  def write_files 
    super + [
      default_gdm_session("gnome"),
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
    super + [
      default_gdm_session("plasma"),
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
    super + [
      default_gdm_session("cosmic"),
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
    if name == "list"
      puts distros.keys.sort.join("\n")
    else
      $stderr.puts "Unknown distro target: #{name.inspect}"
      $stderr.puts distros.keys.sort.join(" ")
    end
    exit 1
  end
end
