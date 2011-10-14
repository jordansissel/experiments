VERSION=0.5.5
URL=http://msgpack.org/releases/cpp/msgpack-$(VERSION).tar.gz
TARBALL=$(shell basename $(URL))
WORKDIR=msgpack-$(VERSION)

include ../Makefile.ext

default: configure

configure: configure-autoconf

build: $(WORKDIR)/src/.libs/libmsgpack.so
$(WORKDIR)/src/.libs/libmsgpack.so: configure
	$(MAKE) -C $(WORKDIR)

install: build
	$(MAKE) -C $(WORKDIR) install
