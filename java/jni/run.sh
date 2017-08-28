#!/bin/sh
set -x

mkdir foo bar

make

cp Thing.class foo/
cp Thing.class bar/

java -Djava.library.path=${PWD} Main
