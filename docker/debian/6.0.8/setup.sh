apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -yq ssh

# undo some leet hax of the base image
rm /usr/sbin/policy-rc.d; \
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

# set a cheap, simple password for great convenience
echo 'root:docker.io' | chpasswd

apt-get install -y gcc curl
curl -sSL https://get.rvm.io | bash -s stable
. /etc/profile
rvm install 1.9.3
