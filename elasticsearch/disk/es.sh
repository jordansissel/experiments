#!/bin/sh

config=$1

if [ -z "$config" ] ; then
  echo "Usage: $0 config.yml"
  exit 1
fi
exec sh ./elasticsearch-0.19.9/bin/elasticsearch -f -Des.default.config=$config
