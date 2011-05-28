

user_xdr.c user.h: user.x
	rpcgen $<

main: main.c user_xdr.c
	gcc $^ -o $@

clean:
	rm -f user.h *.o *_xdr.c main
