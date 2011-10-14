VERSION=4.04
URL=http://dist.schmorp.de/libev/libev-$(VERSION).tar.gz
TARBALL=$(shell basename $(URL))
WORKDIR=libev-$(VERSION)

include ../Makefile.ext
default: build

build: $(WORKDIR)/.libs/libev.so
$(WORKDIR)/.libs/libev.so: configure
	$(MAKE) -C $(WORKDIR)

.PHONY: configure
configure: configure-autoconf

.PHONY: install
install: build
	$(MAKE) -C $(WORKDIR) install
