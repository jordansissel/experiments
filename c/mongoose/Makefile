
build: ipmi

ipmi: mongoose.o ipmi.o
	$(CC) $(LDFLAGS) -o $@ $^

ipmi.c: mongoose.h

mongoose.c: mongoose.h
	curl -s https://raw.githubusercontent.com/cesanta/mongoose/master/mongoose.c > $@

mongoose.h:
	curl -s https://raw.githubusercontent.com/cesanta/mongoose/master/mongoose.h > $@

