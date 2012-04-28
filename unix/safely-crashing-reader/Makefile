CFLAGS=-std=c99 -Wall -pipe
.PHONY: run
run: master
	seq 10 | ./master sh -c 'read a; echo "Read: $$a"'

master: master.c

