FILES=$(shell find ./ -name '*.coffee')
STATIC=public/ views/
OBJECTS=$(addprefix build/, $(subst .coffee,.js,$(FILES)))
DEPS=express socket.io jade coffee-script
DEPS_OBJECTS=$(addprefix node_modules/, $(DEPS))

STATIC_FILES=$(shell find $(STATIC) -type f | egrep '\.(css|js|jade|jpg)$$')
STATIC_OBJECTS=$(addprefix build/, $(STATIC_FILES))

COFFEE=./node_modules/coffee-script/bin/coffee

VPATH=src
default: all

clean:
	rm -f $(OBJECTS)
	rm -r build/

%.coffee: Makefile

build/%.js: %.coffee | build
	@echo "Compiling $< ($@)"
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)$(COFFEE) -c -o $(shell dirname $@) $<

build/%.css: %.css | build
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)cp $< $@

build/%.js: %.js | build
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)cp $< $@

build/%.jade: %.jade | build
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)cp $< $@

build/%.jpg: %.jpg | build
	$(QUIET)[ -d $(shell dirname $@) ] || mkdir -p $(shell dirname $@)
	$(QUIET)cp $< $@

build: 
	$(QUIET)mkdir build

.PHONY: debug
debug:
	echo "$(STATIC_OBJECTS)"

static: $(STATIC_OBJECTS)
compile: deps $(OBJECTS)

node_modules:
	mkdir $@

node_modules/%: | node_modules
	npm install $$(basename $@)

deps: $(DEPS_OBJECTS)

all: compile static
