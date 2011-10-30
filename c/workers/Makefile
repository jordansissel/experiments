CFLAGS=-g -std=c99


server: LDFLAGS=$(shell pkg-config --libs libev 2> /dev/null || echo -lev)
server: CFLAGS+=$(shell pkg-config --cflags libev 2> /dev/null)
server: server.o

default: server

clean:
	-rm -f server server.o
