CFLAGS?=-g

MSGPACK?=/opt/msgpack/0.5.5
LIBEV?=/opt/libev/4.04
ZEROMQ?=/opt/zeromq/2.1.7/

CFLAGS+=-I$(MSGPACK)/include -I/usr/local/include
LDFLAGS+=-L$(MSGPACK)/lib -L/usr/local/lib
CFLAGS+=-I$(LIBEV)/include -I/usr/local/include
LDFLAGS+=-L$(LIBEV)/lib -L/usr/local/lib
CFLAGS+=-I$(ZEROMQ)/include -I/usr/local/include
LDFLAGS+=-L$(ZEROMQ)/lib -L/usr/local/lib

CFLAGS+=-Isrc

QUIET?=@

FILES=syslog_server.c loggly_connection.c loggly_input.c
OBJECTS=$(addprefix build/, $(subst .c,.o,$(FILES)))

VPATH=src
all: default
default: porter

clean:
	rm -f $(OBJECTS)
	rm -r build/

%.c %.h: Makefile

build/%.o: %.c | build
	@echo "Compiling $< ($@)"
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir $(shell dirname $@)
	$(QUIET)$(CC) $(CFLAGS) -c $< -o $@

build: 
	$(QUIET)mkdir build

porter: LDFLAGS+=-lrt -lev -lmsgpack -lzmq
porter: LDFLAGS+=-Xlinker -rpath=$(MSGPACK)/lib -Xlinker -rpath=$(LIBEV)/lib
porter: LDFLAGS+=-Xlinker -rpath=$(ZEROMQ)/lib
porter: $(OBJECTS)
	@echo "Linking $@"
	$(QUIET)$(CC) -o $@ $(LDFLAGS) $^
