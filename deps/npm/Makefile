VERSION=1.0.27
#URL=https://github.com/isaacs/npm/tarball/v$(VERSION)
URL=http://registry.npmjs.org/npm/-/$(TARBALL)
TARBALL=npm-$(VERSION).tgz
TARFLAGS=--transform='s,^[^/]*,npm-$(VERSION),'
WORKDIR=npm-$(VERSION)

default: workdir
include ../Makefile.ext

install: $(WORKDIR)
	@# Nothing to do.

configure:
	@# Nothing to do.
