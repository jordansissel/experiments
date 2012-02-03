default: client

clean:
	-rm -f *.6
client: cabin.6 client.6

%.6: %.go 
	6g $<

%: %.6
	echo $"
	6l -o $@ $<
