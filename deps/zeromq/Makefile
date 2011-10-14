VERSION=2.1.10
URL=http://download.zeromq.org/zeromq-$(VERSION).tar.gz
TARBALL=$(shell basename $(URL))
WORKDIR=zeromq-$(VERSION)

default: install
include ../Makefile.ext

CFLAGS=-I$(PREFIX)/include
LDFLAGS=-L$(PREFIX)/lib 
CXXFLAGS=-I$(PREFIX)/include

configure: dependencies
dependencies: $(PREFIX)/lib/libuuid.so
dependencies: $(PREFIX)/include/uuid/uuid.h

configure: | $(WORKDIR)/Makefile
$(WORKDIR)/Makefile: | $(WORKDIR) 
	cd $(WORKDIR); CFLAGS=$(CFLAGS) CXXFLAGS=$(CXXFLAGS) LDFLAGS=$(LDFLAGS) ./configure --prefix=$(PREFIX)

compile: | $(WORKDIR)/src/.libs/libzmq.so
$(WORKDIR)/src/.libs/libzmq.so: | configure
	$(MAKE) -C $(WORKDIR) CFLAGS=$(CFLAGS) CXXFLAGS=$(CXXFLAGS) LDFLAGS=$(LDFLAGS)

install: | compile $(PREFIX)/lib $(PREFIX)/include
	cp $(WORKDIR)/src/.libs/libzmq.so.1 $(PREFIX)/lib
	ln -sf $(PREFIX)/lib/libzmq.so.1 $(PREFIX)/lib/libzmq.so
	cp $(WORKDIR)/include/zmq.h $(PREFIX)/include
	cp $(WORKDIR)/include/zmq_utils.h $(PREFIX)/include

$(PREFIX)/lib/libuuid.so $(PREFIX)/include/uuid/uuid.h:
	$(MAKE) -C ../libuuid PREFIX=$(PREFIX) $@
