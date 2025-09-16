#!/bin/sh

docker run --volume .:/build:z --mount type=tmpfs,dst=/opt ubuntu:latest sh -xec 'cp -R build work; cd work; sh -ex build.sh && dpkg-deb --fsys-tarfile ./example-1.0_all.deb | tar -tv && apt-get install ./example-1.0_all.deb'
