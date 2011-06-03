#CFLAGS+=-g -DDEBUG
CFLAGS+=-I/usr/local/include
LDFLAGS+=-L/usr/local/lib -lzmq -lpthread -lrt

default: test

clean:
	rm -f *.o msgpack test-msgpack test

msgpack: msgpack-example.o
	$(CC) -L/usr/local/lib -lmsgpack $< -o $@

test-msgpack: test-msgpack.o
	$(CC) $(LDFLAGS) -lmsgpack $< -o $@

.o: .c
	$(CC) $(CFLAGS) -c $< -o $@

test: test.o
	$(CC) $(LDFLAGS) $< -o $@
