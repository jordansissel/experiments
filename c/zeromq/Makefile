#CFLAGS+=-g -DDEBUG
CFLAGS+=-I/usr/local/include
LDFLAGS+=-L/usr/local/lib -lzmq -lpthread -lrt -lmsgpack

default: msgpack-zeromq

clean:
	rm -f *.o msgpack-zeromq

msgpack-zeromq: msgpack-zeromq.o
	$(CC) $(LDFLAGS) $< -o $@

string-zeromq: string-zeromq.o
	$(CC) $(LDFLAGS) $< -o $@

.o: .c
	$(CC) $(CFLAGS) -c $< -o $@
