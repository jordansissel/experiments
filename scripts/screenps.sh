#!/bin/sh

UNAME=`uname`

PATTERN="$1"

case $UNAME in
  FreeBSD) psargs="-euww" ;;
  Linux) psargs="euww" ;;
  *) 
    echo "$uname is not supported"
    exit 1
    ;;
esac

ps $psargs \
| while read proc_user pid pcpu pmem vsz rss tt state start time command; do

  echo "$command" \
  | egrep "$PATTERN" \
  | sed -ne 's/^.* STY=\([^ ]*\).*/\1/p' \
  | sort | uniq \
  | grep -vF "${STY:-NO_STY_SET}"
done
