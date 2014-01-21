#!/bin/sh

# Dockerfiles don't support symlinks for some reason.
# So let's pretend.

for i in 12.04 12.10 13.04 13.10 ; do
  cp setup.sh $i/ # Oh, you could just be a symlink!

  # While we're doing things, might as well add templating...
  sed -e "s/:TAG$/:$i/" Dockerfile.template > $i/Dockerfile
done
