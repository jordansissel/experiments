VERSION=6.7
URL=http://www.complang.org/ragel/ragel-$(VERSION).tar.gz
TARBALL=$(shell basename $(URL))
WORKDIR=ragel-$(VERSION)

default: build
include ../Makefile.ext

build: $(WORKDIR)/ragel/ragel
$(WORKDIR)/ragel/ragel: configure
	$(MAKE) -C $(WORKDIR)

.PHONY: configure
configure: configure-autoconf

.PHONY: install
install: build
	cp $(WORKDIR)/ragel/ragel $(PREFIX)/bin
