#!/bin/sh

while true; do
  echo "Running: $@"
  "$@"
  echo "Exit code: $?"
  sleep 1
done
