OBJS := wipeout.js
all: $(OBJS)

%.js: %.c Makefile
	emcc -s EXPORTED_FUNCTIONS=_wipeout_text -o $@ $<

clean:
	rm -f $(OBJS)
