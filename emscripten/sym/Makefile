
%.o: %.c
	emcc -o $@ -c $<

prog: main.o func.o
	emcc -o $@ main.o func.o
