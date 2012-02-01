default: foo

foo: foo.6
	6l -o $@ $^

foo.go: cabin.6

clean:
	-rm -f *.6

%.6: %.go 
	6g $<

