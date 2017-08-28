.POSIX:
.SUFFIXES:

.PHONY: all clean run
all: libthing.so Main.class Thing.class

clean:
	rm -f thing.o libthing.so Thing.h thing.so

libthing.so: thing.so
	cp $< $@

thing.o: thing.c Thing.h
thing.o: CFLAGS+=-I$${JAVA_HOME}/include -I$${JAVA_HOME}/include/linux 
thing.o: CFLAGS+=-fPIC

Thing.h: Thing.class
	javah Thing

.SUFFIXES: .java .class
.java.class:
	javac $<

.SUFFIXES: .c .o
.c.o:
	$(CC) $(CFLAGS) -c -o "$@" "$<"

.SUFFIXES: .so .o
.o.so:
	$(LD) $(LDFLAGS) -shared -o "$@" "$<"
