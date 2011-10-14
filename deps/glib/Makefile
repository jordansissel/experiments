VERSION=2.28
REV=8
URL=http://ftp.gnome.org/pub/gnome/sources/glib/$(VERSION)/glib-$(VERSION).$(REV).tar.xz
TARBALL=$(shell basename $(URL))
WORKDIR=glib-$(VERSION).$(REV)

default: build
include ../Makefile.ext

build: $(WORKDIR)/.libs/libev.so
$(WORKDIR)/.libs/libev.so: configure
	$(MAKE) -C $(WORKDIR)

.PHONY: configure
configure: configure-autoconf

.PHONY: install
install: build
	$(MAKE) -C $(WORKDIR) install
