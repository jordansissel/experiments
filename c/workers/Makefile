CFLAGS=-g -std=c99 -Wall -Werror

default: evented

server.c: server.h insist.h session.h Makefile
session.c: insist.h session.h Makefile

evented: LDFLAGS=$(shell pkg-config --libs libev 2> /dev/null || echo -lev)
evented: CFLAGS+=$(shell pkg-config --cflags libev 2> /dev/null)
evented: session.o server.o evented.o
	$(CC) -o $@ $(LDFLAGS) $^

clean:
	-rm -f server server.o
