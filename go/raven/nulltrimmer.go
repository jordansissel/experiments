package main

import (
	"io"
)

type NullTrimmer struct {
	reader io.Reader
}

func (t NullTrimmer) Read(p []byte) (n int, err error) {
	n, err = t.reader.Read(p)
	if err != nil {
		return
	}

	// Sometimes the first byte of a read from the serial port is a NUL, which
	// upsets the XML decoder, so let's remove that.
	if p[0] == '\x00' {
		n -= 1
		copy(p, p[1:])
	}
	return
}
