COFFEE_FILES=$(shell git ls-files | grep '\.coffee$$' 2> /dev/null)
STATIC+=views/ public/ app.js
COFFEE_OBJECTS=$(addprefix $(BUILDDIR)/, $(subst .coffee,.js,$(COFFEE_FILES)))
DEPS=coffee-script
DEPS_OBJECTS=$(addprefix $(BUILDDIR)/node_modules/, $(DEPS))

STATIC_FILES=$(shell find $(STATIC) -type f 2> /dev/null | egrep '\.(css|js|jade|jpg|sass|gif)$$')
STATIC_OBJECTS=$(addprefix $(BUILDDIR)/, $(STATIC_FILES))

NPM=$(CURDIR)/build/build-tools/npm/bin/npm.js
COFFEE=./$(BUILDDIR)/node_modules/coffee-script/bin/coffee
VPATH=src
QUIET=@
BUILDDIR?=build

default: all
all: compile static

$(BUILDDIR)/node_modules/coffee-script: VERSION=1.1.1

clean:
	rm -f $(COFFEE_OBJECTS) $(STATIC_OBJECTS)

superclean:
	rm -rf $(BUILDDIR)/

coffee-script: $(BUILDDIR)/node_modules/coffee-script

%.coffee: Makefile

$(BUILDDIR)/%.js: %.coffee | $(BUILDDIR) coffee-script
	@echo "Compiling $< (to $@)"
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)$(COFFEE) -c -o $(shell dirname $@) $<

$(BUILDDIR)/%.css: %.css | $(BUILDDIR)
	@echo "Copying $< (to $@)"
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)cp $< $@

$(BUILDDIR)/%.sass: %.sass | $(BUILDDIR)
	@echo "Copying $< (to $@)"
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)cp $< $@

$(BUILDDIR)/%.js: %.js | $(BUILDDIR)
	@echo "Copying $< (to $@)"
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)cp $< $@

$(BUILDDIR)/%.jade: %.jade | $(BUILDDIR)
	@echo "Copying $< (to $@)"
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)cp $< $@

$(BUILDDIR)/%.jpg: %.jpg | $(BUILDDIR)
	@echo "Copying $< (to $@)"
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)cp $< $@

$(BUILDDIR)/%.gif: %.gif | $(BUILDDIR)
	@echo "Copying $< (to $@)"
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)cp $< $@

$(BUILDDIR): 
	$(QUIET)mkdir $(BUILDDIR)

.PHONY: debug
debug:
	echo $(VERSION)

static: $(STATIC_OBJECTS)
compile: deps $(COFFEE_OBJECTS)

$(BUILDDIR)/node_modules: | $(BUILDDIR)
	$(QUIET)mkdir $@

$(BUILDDIR)/node_modules/%: VERSIONSPEC=$(shell [ ! -z "$(VERSION)" ] && echo "@$(VERSION)")
$(BUILDDIR)/node_modules/%: NAME=$(shell basename $@)
$(BUILDDIR)/node_modules/%: | $(BUILDDIR)/node_modules $(NPM)
	@echo "Installing $(NAME)$(VERSIONSPEC)"
	$(QUIET)(cd $(BUILDDIR); node $(NPM) install $(NAME)$(VERSIONSPEC))

$(BUILDDIR)/build-tools: | $(BUILDDIR)
	mkdir $@

$(BUILDDIR)/build-tools/npm: | $(BUILDDIR)/build-tools
	mkdir $@

npm: $(NPM)
$(NPM): | $(BUILDDIR)/build-tools/npm
	wget -qO - http://registry.npmjs.org/npm/-/npm-1.0.30.tgz \
		| tar -zxf - -C $(BUILDDIR)/build-tools --transform 's,^package/,npm/,'

deps: $(DEPS_OBJECTS)

$(BUILDDIR)/vxin-loggly-full.js: compile
	cat \
	$(BUILDDIR)/public/javascripts/d3/d3.js \
	$(BUILDDIR)/public/javascripts/d3/d3.geom.js \
	$(BUILDDIR)/public/javascripts/d3/d3.behavior.js \
	$(BUILDDIR)/public/javascripts/d3/d3.layout.js \
	$(BUILDDIR)/public/javascripts/d3/d3.csv.js \
	$(BUILDDIR)/public/javascripts/d3/d3.time.js \
	$(BUILDDIR)/public/javascripts/d3/d3.chart.js \
	$(BUILDDIR)/public/javascripts/d3/d3.geo.js \
	$(BUILDDIR)/public/javascripts/inputs/*.js \
	$(BUILDDIR)/public/javascripts/outputs/*.js \
	$(BUILDDIR)/public/javascripts/widget.js \
	$(BUILDDIR)/public/javascripts/vxin-loggly.js \
	> $@
