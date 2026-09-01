//go:build darwin
package tmp

import (
	"os"
	"path"

	"golang.org/x/sys/unix"
)

func open(fspath string) (*os.File, error) {
	f, err := os.CreateTemp(path.Dir(fspath), path.Base(fspath) + ".new*")
	if err != nil {
		return nil, err
	}

	// Delete the file entry leaving just the file descriptor we can link later on Commit().
	err = os.Remove(f.Name())

	if err != nil {
		return nil, err
	}

	return f, nil
}

func (f *AtomicFile) commit() error {
	//return os.Rename(f.File.Name(), f.path);
	//return unix.Renameat(int(f.File.Fd()), f.File.Name(), unix.AT_FDCWD, f.path);
	
	fd := int(f.File.Fd())
	return unix.Fclonefileat(fd, fd, f.path, 0);
}

