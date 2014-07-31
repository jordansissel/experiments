#!/bin/sh

# Dockerfiles don't support symlinks for some reason.
# So let's pretend.

. ./versions.rc
for i in $versions; do
  [ ! -d "$i" ] && mkdir "$i"
  cp setup.sh init-lxc.conf $i/ # Oh, you could just be a symlink!

  # While we're doing things, might as well add templating...
  sed -e "s/:TAG$/:$i/" Dockerfile.template > $i/Dockerfile
done
