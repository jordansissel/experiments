#!/bin/sh
#
# Author: Jordan Sissel, 2008.
# Requirements: xdotool
# 
# This script will activate the terminal window holding the given screen
# session, if any is found.
#
# For your terminal to set its title when screen changes its title, you
# may need to add the following lines to your .screenrc:
#
# hardstatus string "[%n] %h - %t"
# termcapinfo xterm 'hs:ts=\E]2;:fs=\007:ds=\E]2;screen (not title yet)\007'
#

usage() {
  echo "Usage: $0 <screen_session> [window]"
}

case $# in
  0) read STY WINDOW ;;
  1|2) STY=$1; WINDOW=$2 ;;
  *) 
    exit 1
    ;;
esac

echo $STY $WINDOW

if [ -z "$STY" ] ; then
  usage
  exit 1;
fi

export STY
SEARCHKEY="FINDME $0 $$"

# Create a new screen window in the given session. 
# The title of this screen will be $SEARCHKEY
# we use 'read a' here to wait until the enter key is pressed.
# We will send the enter key later.
screen -X screen -t "$SEARCHKEY" sh -c 'read a'

# Now search for that window title
window="$(xdotool search --title "$SEARCHKEY")"

# We found the window, let's send a newline to end the 'read a',
# thus closing the added screen window and returning us to our
# previous screen window in that session
screen -X eval 'stuff \012'

if [ -z "$window" ] ; then
  echo "No window found holding screen session $STY"
  echo "Querying...."
  screenls="$(screen -ls $STY)" 
  
  if echo "$screenls" | head -1 | egrep -q '^(This room is empty)|(No )' ; then
    echo "No such screen session: $STY"
  else
    echo "$screenls"
  fi
else
  # Activate the window found
  xdotool windowactivate $window
  if [ "$?" -ne 0 ] ; then
    if [ ! -z "$WMII_ADDRESS" ] ; then
      echo "select client $window" | wmiir write /tag/sel/ctl
    fi
  fi

  if [ ! -z "$WINDOW" ] ; then
    screen -X select $WINDOW
  fi
fi
