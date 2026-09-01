//go:build linux

package tmp

import (
	"os"
	"path"

	"golang.org/x/sys/unix"
)

func open(fspath string) (*os.File, error) {
	return os.OpenFile(path.Dir(fspath), unix.O_RDWR|unix.O_TMPFILE, 0644)
}

func (f *AtomicFile) commit() error {
	// See linkat(2) and open(2)'s O_TMPFILE documentation on Linux for more information.
	return unix.Linkat(int(f.File.Fd()), "", unix.AT_FDCWD, f.path, unix.AT_EMPTY_PATH)
}
