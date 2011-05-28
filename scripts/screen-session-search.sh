#!/bin/sh

JOBS=${JOBS:-10}
OUTDIR=${OUTDIR:-$(mktemp -d)}
if [ -z "$OUTDIR" -o ! -d "$OUTDIR" ] ; then
  echo "mktemp -d failed or \$OUTDIR is not a directory."
fi
export OUTDIR


screenlist() {
  screen -ls | awk '/^[\t ]/ {print $1}'
}

capture_all() {
  if [ "$(ls $OUTDIR | wc -l)" -gt 0 ] ; then
    return
  fi

  screenlist \
  | egrep -v SCREENTMP \
  | xargs -n1 -P${JOBS} sh -c 'screen-session-hardcopy.sh $1 2> /dev/null' - 
}

screen_processes_grep() {
  if [ ! -f "/proc/$$/cmdline" ] ; then
    echo "This tool requires procfs (freebsd or linux)."
    exit 1
  fi

  for proc in /proc/[0-9]* ; do
    pid=${proc#/proc/}
    if [ "$pid" -ne "$$" -a -r $proc/environ ] ; then
      if xargs -0 < $proc/cmdline | grep -q "$@" ; then
        xargs -n1 -0 < $proc/environ | sed -ne 's/\(STY\|WINDOW\)=//p'
      fi | paste -d ' ' - -
    fi
  done
}

search() {
  capture_all
  query=$1
  files="$2"
  shift; shift;

  case $query in
    location|title) files="$(ls $OUTDIR/*:windowlist)" ;;
    windowcontents) files="$(ls $OUTDIR/ | grep -v ':windowlist$')" ;;
  esac

  MATCHES="$(cd $OUTDIR; grep -l "$@" $files)"

  for M in $MATCHES ; do
    fsty=$(echo $(basename $M) | awk -F: '{print $1}')
    fwin=$(echo $(basename $M) | awk -F: '{print $2}')
    if [ "$fwin" = "windowlist" ] ; then
      if [ "$query" = "location" ] ; then
        fwin="$(awk 'NF > 1 { print $1, $(NF - 1) }' $M \
                | grep "$@" | awk '{print $1}')"
      else
        fwin="$(egrep "$@" $M | awk '{ print $1 }')"
      fi
    fi

    if [ ! -z "$fsty" -a ! -z "$fwin" ] ; then
      echo "$fsty $fwin"
    fi
  done
}


SEARCH=""

eval set -- `getopt -s sh twlc "$@"`
while [ $# -gt 0 ]; do
  case $1 in
    -t) SEARCH="${SEARCH} title" ;;
    -w) SEARCH="${SEARCH} windowcontents" ;;
    -l) SEARCH="${SEARCH} location" ;;
    -c) SEARCH="${SEARCH} cmdline" ;;
    --) break ;;
  esac
  shift;
done

[ -z "$SEARCH" ] && SEARCH="title windowcontents location cmdline"

for QUERY in $SEARCH; do
  case $QUERY in
    cmdline) screen_processes_grep "$@" ;;
    windowcontents|location|title) search $QUERY "$@" ;;
  esac
done \
| sort | uniq | grep -v "$STY $WINDOW"
# the previous grep is to remove our screen and window from the output list

# Clean up
rm -r "$OUTDIR"
rm -f /tmp/log.*
