#!/bin/sh

set -x

if [ ! -f "/srv/data/.setup_done" ] ; then
  cp -vR /var/www/nextcloud/data /srv/
  touch /srv/data/.setup_done
fi
 
if [ ! -d "/etc/letsencrypt/live" ] ; then
  letsencrypt --apache certonly --agree-tos -d "$WEBDOMAIN" --email "$EMAIL"
else
  letsencrypt renew
fi
apachectl stop

echo args $#
echo "$@"

if [ "$#" -eq 0 ] ; then
  set -- apachectl -d /etc/apache2 -f /etc/apache2/apache2.conf -e info -DFOREGROUND
fi

exec "$@"
