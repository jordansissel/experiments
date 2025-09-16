#!/bin/sh

rm -f example-1.0_all.deb

mkdir -p opt/example usr/share/example
echo "Hello" >opt/example/hello.txt
ln opt/example/hello.txt usr/share/example/hello.txt

dpkg-deb -b . example-1.0_all.deb
