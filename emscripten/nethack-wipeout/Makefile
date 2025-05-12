OBJS := wipeout.js
all: $(OBJS)

CC = emcc
CFLAGS += -sEXPORTED_FUNCTIONS='_wipeout_text,stringToNewUTF8,UTF8ToString,_free' \
 -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='$$stringToNewUTF8,$$UTF8ToString'

CFLAGS += --post-js=wrapper.js
CFLAGS += -g -gsource-map

%.js: %.c Makefile wrapper.js
	$(CC) $(CFLAGS) -o $@ $<

clean:
	rm -f $(OBJS)
