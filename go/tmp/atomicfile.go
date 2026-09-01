package tmp

import (
	"os"
)

// AtomicFile is an os.File-like struct which allows you to write data and modify metadata before committing it to a specific filename.
//
// The intended use is to ensure complete files are only ever available at the given path.
type AtomicFile struct {
	os.File
	path string
}

// New opens an unnamed temporary file.
//
// Note: this only works on certain filesystems on Linux. See the `O_TMPFILE` documentation on `open(2)` for more details.
//
// If you wish to commit writes to this file path, you must also call Commit() *after* writing.
func New(fspath string) (*AtomicFile, error) {
	f, err := open(fspath)

	if err != nil {
		return nil, err
	}

	return &AtomicFile{File: *f, path: fspath}, nil
}

// Commit acts upon the file to atomically replace it on disk.
// This implicitly also calls Close()
func (f *AtomicFile) Commit() error {
	err := f.commit()

	// Close after attempting to commit, even if the commit fails.
	// Nothing can be done so we should still close the file
	_ = f.File.Close()

	return err
}

// Chmod -- see os.File.Chmod()
func (f *AtomicFile) Chmod(mode os.FileMode) error {
	return f.File.Chmod(mode)
}

// Chown -- see os.File.Chown()
func (f *AtomicFile) Chown(uid, gid int) error {
	return f.File.Chown(uid, gid)
}

// Write -- see Writer interface
func (f *AtomicFile) Write(data []byte) (n int, err error) {
	return f.File.Write(data)
}

// Close - see Closer interface.
func (f *AtomicFile) Close() error {
	return f.File.Close()
}
