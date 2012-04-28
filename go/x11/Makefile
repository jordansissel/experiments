build: test

test: test.go
	GOPATH=$(PWD) go build $<

deps: src/cabin

# 'go get' doesn't support repos with dashes in the name, and breaking my pattern
# of calling repos '<language>-<repo>' is silly, especially when calling it "gocabin"
# requires all my code to use 'go...' as a namespace prefix. Not worth it.
# So just download master and unpack it into src.
.PHONY: src/cabin
src/cabin:
	curl -Lso - https://github.com/jordansissel/go-cabin/tarball/master \
		| tar -zvxf - --strip-components=1 '*'/src/cabin

