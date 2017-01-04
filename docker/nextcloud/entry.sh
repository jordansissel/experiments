#!/bin/sh

if [ ! -f "/srv/data/.setup_done" ] ; then
  cp -R /var/www/nextcloud/data/ /srv/data/
fi

exec "$@"
