
CXXFLAGS=-std=c++11 -fPIC -I $${NODE_HOME}/include/node -I.
LDFLAGS=-shared

lockdown.node: module.cpp lockdown.c
	@if [ -z "$${NODE_HOME}" ] ; then \
		echo "NODE_HOME must be set so that I can find include/node/node.h" ; \
		exit 1 ; \
	fi
	$(CXX) -o $@ $(CXXFLAGS) $(LDFLAGS) $^

.PHONY: all
all: lockdown.node

.PHONY: clean
clean:
	@rm -f lockdown.node
