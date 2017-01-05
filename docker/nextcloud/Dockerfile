FROM ubuntu:16.10
ENV WEBDOMAIN pork.semicomplete.com
ENV EMAIL jls@semicomplete.com

RUN apt-get update

# Translated from the nextcloud docs:
# https://docs.nextcloud.com/server/11/admin_manual/installation/source_installation.html#example-installation-on-ubuntu-14-04-lts-server

# Install requirements (apache, php7, etc)
RUN apt-get install -y\
  sudo\
  bzip2\
  wget\
  apache2\
  libapache2-mod-php7.0\
  php7.0-gd\
  php7.0-json\
  php7.0-mysql\
  php7.0-curl\
  php7.0-intl\
  php7.0-mcrypt\
  php-imagick\
  php7.0-mbstring\
  php7.0-xml\
  php7.0-zip\
  php7.0-sqlite

# "Recommended packages"
RUN apt-get install -y \
  php7.0-curl\
  php7.0-fileinfo\
  php7.0-bz2\
  php7.0-intl\
  php7.0-mcrypt\
  php7.0-exif

  #php7.0-apcu
  #php7.0-openssl\

# For letsencrypt
RUN apt-get install -y python-certbot-apache 

# I'm not using mariadb yet ... and it's not clear I will. Docker makes it
# really annoying to run multiple processes in a single container.
#RUN apt-get install -y mariadb-server php7.0-pdo_mysql

# Download nextcloud
RUN wget -qO /tmp/nextcloud-11.0.0.tar.bz2 https://download.nextcloud.com/server/releases/nextcloud-11.0.0.tar.bz2

# Verify
ADD integrity/nextcloud-11.0.0.tar.bz2.sha256 integrity/nextcloud.asc integrity/nextcloud-11.0.0.tar.bz2.asc /tmp/
RUN gpg --import /tmp/nextcloud.asc && gpg --verify /tmp/nextcloud-11.0.0.tar.bz2.asc /tmp/nextcloud-11.0.0.tar.bz2

# From https://docs.nextcloud.com/server/11/admin_manual/installation/source_installation.html#apache-configuration-label
RUN a2enmod rewrite headers env dir mime ssl

ADD apache-httpd/default-ssl.conf apache-httpd/nextcloud.conf /etc/apache2/sites-available/

RUN a2ensite default-ssl nextcloud
# XXX: Enable webdav

# XXX: Randomize the password.
# Extract to /var/www/nextcloud
RUN install -d -o www-data -g www-data /var/www/nextcloud 
RUN sudo -u www-data tar -jxf /tmp/nextcloud-11.0.0.tar.bz2 -C /var/www/

# Install nextcloud
RUN cd /var/www/nextcloud; sudo -u www-data php occ maintenance:install --database sqlite --admin-user admin --admin-pass changeme

# Add extra domains
RUN cd /var/www/nextcloud; sudo -u www-data php occ config:system:set trusted_domains 0 --value localhost; \
    sudo -u www-data php occ config:system:set trusted_domains 1 --value pork.lan; \
    sudo -u www-data php occ config:system:set trusted_domains 2 --value pork.semicomplete.com; \
    sudo -u www-data php occ config:system:set trusted_domains 3 --value pork;

RUN mkdir -p /srv/data
RUN cd /var/www/nextcloud; sudo -u www-data php occ config:system:set datadirectory --value /srv/data

ADD entry.sh /usr/bin/nextcloud-entry.sh
RUN chmod 755 /usr/bin/nextcloud-entry.sh

EXPOSE 443
ENTRYPOINT [ "/usr/bin/nextcloud-entry.sh" ]
