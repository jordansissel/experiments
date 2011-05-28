#!/bin/sh

SCREENTMP="SCREENTMP_$(basename $0).$$"
SLEEP=.2
export SLEEP

SHOULD_OUTPUT_DIR=0
if [ -z "$OUTDIR" ] ; then
  OUTDIR="$(mktemp -d)"
  SHOULD_OUTPUT_DIR=1
  export OUTDIR
fi

if [ ! -d "$OUTDIR" ] ; then
  echo "Output directory target is not a directory: $OUTDIR"
  exit 1
fi

log() {
  [ ! -z "$DEBUGHARDCOPY" ] && echo "$$: $@" >&2
}

tmpscreen() {
  screen -S $SCREENTMP -p 0 -d -m

  while true; do
    CAPSTY="$(screen -ls | grep -F $SCREENTMP | awk '{print $1}')"
    if [ -z "$CAPSTY" ] ; then
      log "Failure to find capture screen: $CAPSTY / $SCREENTMP"
    else
      break;
    fi
    sleep $SLEEP
  done
  echo $CAPSTY
}

quitscreen() {
  CAPSTY=$1
  if [ -z "$CAPSTY" ] ; then
    echo "No sty given to quit"
    return 1
  fi

  STY=$CAPSTY screen -X quit
}

_hardcopy() {
  _VIEWSTY=$1
  _WINDOW=$2
  _OUT=$3

  log "_hardcopy args: $*"

  log "Trying hardcopy on $_VIEWSTY:$_WINDOW > $_OUT"
  for tries in 1 2 3; do
    env STY=$_VIEWSTY screen -p $_WINDOW -X hardcopy $_OUT 
    for tries in 1 2 3 4 5; do
      log "Calling filesize: '$_OUT'"
      size="$(_filesize "$_OUT")"
      [ "$size" -gt 0 ] && break 2
      sleep $SLEEP
    done
  done
}

_mktemp() {
  tmpfile=$(mktemp)
  if [ -z "$tmpfile" ] ; then
    log "mktemp failed."
    return 1
  fi

  echo $tmpfile
}

_filesize() {
  if [ -z "$1" ] ; then
    log "No file given to _filesize"
    exit 1
  fi

  stat -x > /dev/null 2>&1 && statarg="-x"

  stat $statarg $1 2> /dev/null \
  | awk '/^[0-9]/ { print $1 }; /^  Size/ { print $2}' 2> /dev/null
}

windowlist() {
  CAPSTY=$(tmpscreen)
  VIEWSTY=$1

  if [ -z "$VIEWSTY" ] ; then
    log "No screen sty given."
    return 1
  fi

  OUT="$OUTDIR/$VIEWSTY:windowlist"
  STY=$CAPSTY screen -X screen screen -p = -x $VIEWSTY
  for tries in 1 2 3 ; do
    log windowlist: _hardcopy $CAPSTY 1 $OUT
    _hardcopy $CAPSTY 1 $OUT
    for tries in 1 2 3 ; do
      if grep -vq '^ *$' "$OUT" ; then
        break 2
      fi
      sleep $SLEEP
    done
  done

  quitscreen $CAPSTY

  sed -i -e '1d; /^ *$/d' $OUT
  cat $OUT
}

dumpwindows() {
  VIEWSTY=$1

  if [ -z "$VIEWSTY" ] ; then
    log "No screen sty given."
    return 1
  fi

  for W in $(windowlist $VIEWSTY | awk '{print $1}') ; do
    log "Dumping window $VIEWSTY:$W"
    HARDOUT="$OUTDIR/$VIEWSTY:$W"
    log dumpwindows: _hardcopy $VIEWSTY $W $HARDOUT
    _hardcopy $VIEWSTY $W $HARDOUT
  done
}

catout() {
  for f in $(ls -d $OUTDIR/*) ; do
    sed -e "s,^,$f: ," $f
  done
}

if [ "$#" -eq 0 ] ; then
  echo "Usage: $0 <screen>"
  exit 1
fi

if [ -z "$OUTDIR" -o ! -d "$OUTDIR" ] ; then
  log "mktemp -d failed."
  exit 1
fi

dumpwindows $1

if [ "$SHOULD_OUTPUT_DIR" -eq 1 ] ; then
  echo $OUTDIR
fi
