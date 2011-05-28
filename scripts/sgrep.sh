#!/bin/sh

re="$1"
shift
[ "$#" -eq 0 ] && set -- -

gsed -rne '/^$/!H; /^$/ { x; /'"$re"'/p; }; ${ x; /'"$re"'/p; d; } ' "$@"

