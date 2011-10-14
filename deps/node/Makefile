VERSION=0.4.12
URL=http://nodejs.org/dist/node-v$(VERSION).tar.gz
TARBALL=$(shell basename $(URL))
WORKDIR=node-v$(VERSION)

default: build
include ../Makefile.ext

build: $(WORKDIR)/bin/node
$(WORKDIR)/bin/node: configure
	$(MAKE) -C $(WORKDIR)

.PHONY: configure
configure: configure-autoconf

.PHONY: install
install: build
	$(MAKE) -C $(WORKDIR) install
