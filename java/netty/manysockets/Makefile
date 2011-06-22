default: java-compile

.PHONY: netty
netty: netty-3.2.4.Final.jar 

netty-3.2.4.Final-dist.tar.bz2:
	wget http://sourceforge.net/projects/jboss/files/$@

netty-3.2.4.Final.jar: netty-3.2.4.Final-dist.tar.bz2
	tar -xf $< --strip-components=2 netty-3.2.4.Final/jar/netty-3.2.4.Final.jar
	touch $@  # because the jar file will be older than the tarball.

JAVA_SRCS=$(shell find ./ -name '*.java')

build:
	mkdir build

.PHONY: run
run: java-compile
	java -cp netty-3.2.4.Final.jar:build ServerTest

$(JAVA_SRCS): netty

.PHONY: java-compile
java-compile: $(JAVA_SRCS) | build
	javac -d build -cp netty-3.2.4.Final.jar:build $^
