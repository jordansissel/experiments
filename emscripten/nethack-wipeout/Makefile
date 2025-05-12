OBJS := wipeout.js
all: $(OBJS)

CC = emcc
CFLAGS += -sEXPORTED_FUNCTIONS='_wipeout_text,stringToNewUTF8,UTF8ToString,_free' \
 -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='$$stringToNewUTF8,$$UTF8ToString' \
 -sWASM=0

# Disable WASM because fastmail web serves .wasm as application/octet-stream

CFLAGS += --post-js=wrapper.js

%.js: %.c Makefile wrapper.js
	$(CC) $(CFLAGS) -o $@ $<

clean:
	rm -f $(OBJS)
