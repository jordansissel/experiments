#!/bin/sh

_lock() {
  pkill -STOP mplayer
  pkill -STOP xmms
  aumix -W 0
}

_unlock() {
  pkill -CONT mplayer
  pkill -CONT xmms
  aumix -W 100
}

xscreensaver-command -watch \
  | while read a; do
    echo "$a" | grep '^LOCK' && _lock
    echo "$a" | grep '^UNBLANK' && _unlock
  done

