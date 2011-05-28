#!/bin/sh
# screen finder... thing.
#
# Greps the current screen of each current screen session for text.
# If only one match is found, then it will do one of two things:
# 1) If the screen is already attached somewhere, then we will make that screen
#    blink so you see it.
# 2) If the screen is detached, then we will attach now.
#
# If multiple are found, each screen session name is output.
#
# Usage:
# ./sfind.sh <pattern>

windowcat() {
  tmp=`mktemp`
  STY=$1 screen -X hardcopy $tmp
  cat $tmp
  rm $tmp
}

screenlist() {
  screen -ls | grep '^	' | awk '{print $1}'
}

findscreen() {
  for other in `screenlist`; do
    # Only check screens that are not the current screen
    if [ "$STY" != "$other" ] ; then
      if windowcat $other | egrep -q "$1" ; then
        echo $other
      fi
    fi
  done
}

activate() {
  s=$1
  status=`screen -ls $s | grep $s | tr -d '()' | awk '{print $NF}'`

  case $status in
    Attached)
      echo "$s"
      for blink in 1 2 3 4 5; do
        STY="$s" screen -X select -
        sleep .05
        STY=$s screen -X select 0
        sleep .05
      done
      ;;
    Detached)
      screen -x $s
      ;;
    *)
      echo "Unknown status $status on screen $s"
      ;;
  esac
}

ACTIVATE=1
if [ "$1" = "-n" ] ; then
  ACTIVATE=0;
  shift
fi
screens=`findscreen "$@"`

found=`echo -n "$screens" | wc -w`

case $found in
    0) echo "None found." ;;
    1) 
      [ "$ACTIVATE" -eq 1 ] && activate $screens
      echo "$screens"
      ;;
    *)
      echo "Multiple found:"
      echo "$screens"
esac
