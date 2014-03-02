sed -i -e 's@archive.ubuntu.com@ubuntu.mirrors.tds.net@g' /etc/apt/sources.list

apt-get update 
DEBIAN_FRONTEND=noninteractive apt-get install -yq ssh

# Undo some bad decisions docker(?) makes about init.
rm /usr/sbin/policy-rc.d
rm /sbin/initctl; dpkg-divert --rename --remove /sbin/initctl

# generate a nice UTF-8 locale for our use
locale-gen en_US.UTF-8 && update-locale LANG=en_US.UTF-8

# remove some pointless services
/usr/sbin/update-rc.d -f ondemand remove; \
	( \
		cd /etc/init; \
		for f in \
			u*.conf \
			tty[2-9].conf \
			plymouth*.conf \
			hwclock*.conf \
			module*.conf\
		; do \
			mv $f $f.orig; \
		done \
	); \
	echo '# /lib/init/fstab: cleared out for bare-bones lxc' > /lib/init/fstab

# small fix for SSH in 13.10 (that's harmless everywhere else)
sed -ri 's/^session\s+required\s+pam_loginuid.so$/session optional pam_loginuid.so/' /etc/pam.d/sshd

addgroup sudo
useradd -m -G adm,sudo vagrant
echo 'root:docker.io' | chpasswd
echo 'vagrant:vagrant' | chpasswd
mkdir -p /home/vagrant/.ssh
# vagrant ssh pubkey
# from: https://github.com/mitchellh/vagrant/blob/master/keys/vagrant.pub
echo "ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA6NF8iallvQVp22WDkTkyrtvp9eWW6A8YVr+kz4TjGYe7gHzIw+niNltGEFHzD8+v1I2YJ6oXevct1YeS0o9HZyN1Q9qgCgzUFtdOKLv6IedplqoPkcmF0aYet2PkEDo3MlTBckFXPITAMzF8dJSIFo9D8HfdOV0IAdx4O7PtixWKn5y2hMNG0zQPyUecp4pzC6kivAIhyfHilFR61RGL+GPXQ2MWZWFYbAGjyiYJnAmCP3NOTd0jMZEnDkbUvxhMmBYSdETk1rRgm+R4LOzFUGaHqHDLKLX+FIPKcF96hrucXzcWyLbIbEgE98OHlnVYCzRdK8jlqm8tehUc9c9WhQ== vagrant insecure public key" >> /home/vagrant/.ssh/authorized_keys
chmod 711 /home/vagrant/.ssh
chown -R vagrant /home/vagrant 

# Make sudo passwordless
echo "vagrant ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

apt-get install -y gcc curl
curl -sSL https://get.rvm.io | bash -s stable
. /etc/profile
rvm install 1.9.3
