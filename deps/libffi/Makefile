VERSION=3.0.10
URL=ftp://sourceware.org/pub/libffi/libffi-$(VERSION).tar.gz
TARBALL=$(shell basename $(URL))
WORKDIR=libffi-$(VERSION)

default: build
include ../Makefile.ext

build: $(WORKDIR)/.libs/libffi.so
$(WORKDIR)/.libs/libffi.so: configure
	$(MAKE) -C $(WORKDIR)

.PHONY: configure
configure: configure-autoconf

.PHONY: install
install: build
	$(MAKE) -C $(WORKDIR) install
