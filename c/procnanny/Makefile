CFLAGS=-I/usr/local/include
LDFLAGS=-L/usr/local/lib -lzmq -lpthread -lrt

default: test

msgpack: msgpack-example.o
	$(CC) -L/usr/local/lib -lmsgpack $< -o $@

test.o: test.c
	$(CC) $(CFLAGS) -c $< -o $@

test: test.o
	$(CC) $(LDFLAGS) $< -o $@
