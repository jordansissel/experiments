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
	temp, err := os.CreateTemp(path.Dir(f.path), path.Base(f.path)+".new*")
	if err != nil {
		return err
	}
	defer temp.Close()
	err = os.Remove(temp.Name())
	if err != nil {
		return err
	}

	// See linkat(2) and open(2)'s O_TMPFILE documentation on Linux for more information.
	err = unix.Linkat(int(f.File.Fd()), "", unix.AT_FDCWD, temp.Name(), unix.AT_EMPTY_PATH)
	if err != nil {
		return err
	}
	defer f.File.Close()

	return os.Rename(temp.Name(), f.path)
}
