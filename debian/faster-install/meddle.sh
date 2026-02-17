#!/bin/sh

set -x
set -e

exclude_docs() {
  echo "path-exclude=/usr/share/doc/*" >>/etc/dpkg/dpkg.cfg.d/meddle
  echo "path-exclude=/usr/share/man/*" >>/etc/dpkg/dpkg.cfg.d/meddle
}

no_triggers() {
  echo "no-triggers" >>/etc/dpkg/dpkg.cfg.d/meddle
}

strip_scripts() {
  find /var/cache/apt/archives -type f -name '*.deb' -print0 | xargs -0 -P4 -n5 sh /usr/bin/stripdeb.sh
}

for i in "$@"; do
  case "$i" in
  exclude_docs | no_triggers | strip_scripts) "$i" ;;
  *)
    echo "Unknown command: $i"
    exit 1
    ;;
  esac
done
