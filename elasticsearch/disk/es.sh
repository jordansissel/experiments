#!/bin/sh

config=$1
if [ -z "$config" ] ; then
  echo "Usage: $0 config.yml"
  exit 1
fi

export ES_MAX_MEM=4g

exec sh ./elasticsearch-0.19.9/bin/elasticsearch -Des.default.config=$config -f
