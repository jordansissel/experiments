CFLAGS=-g -O2 -std=c99 -Wall -Werror

default: evented

server.c: server.h insist.h session.h Makefile
session.c: insist.h session.h Makefile

evented: LDFLAGS=$(shell pkg-config --libs libev 2> /dev/null || echo -lev)
evented: CFLAGS+=$(shell pkg-config --cflags libev 2> /dev/null)
evented: CFLAGS+=-DEVENTED
evented: session.o server.o evented.o
	$(CC) -o $@ $(LDFLAGS) $^

threaded: LDFLAGS+=-pthread
threaded: CFLAGS+=-pthread
threaded: session.o server.o threaded.o
	$(CC) -o $@ $(LDFLAGS) $^

clean:
	-rm -f server *.o
