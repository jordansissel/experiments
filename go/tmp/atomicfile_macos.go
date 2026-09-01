//go:build darwin

package tmp

import (
	"os"
	"path"

	"golang.org/x/sys/unix"
)

func open(fspath string) (*os.File, error) {
	f, err := os.CreateTemp(path.Dir(fspath), path.Base(fspath)+".new*")
	if err != nil {
		return nil, err
	}

	// Delete the filename while leaving the file open.
	// The file will get a real name on disk during commit()
	err = os.Remove(f.Name())
	if err != nil {
		return nil, err
	}

	return f, nil
}

func (f *AtomicFile) commit() error {
	fd := int(f.File.Fd())

	// Give the file a name again...
	// XXX: This could fail if a file with this name already exists...
	err := unix.Fclonefileat(fd, fd, f.File.Name(), 0)
	if err != nil {
		return err
	}

	return os.Rename(f.File.Name(), f.path)
}
