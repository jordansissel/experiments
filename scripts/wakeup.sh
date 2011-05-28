#!/bin/sh

beep() {
  printf '\007' > /dev/ttyv0
}

alarm() {
  SLEEP=$1
  REPS=$2
  for i in `jot $REPS`; do
    beep
    sleep $SLEEP
  done
}

# real quick burst, hopefully jar me closer to consciousness
alarm .2 3

# Slow ramp up beeps

# alarm secs reps
alarm 15 4
alarm 7 5
alarm 3 7
alarm 1 7
alarm .1 30
