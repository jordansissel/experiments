package tmp

import (
	"bytes"
	"fmt"
	"io/fs"
	"os"
	"path"
	"testing"
)

func TestWrites(t *testing.T) {
	workdir, err := os.MkdirTemp("", "atomic-file")
	if err != nil {
		t.Errorf("During setup, failed to create a temporary directory to use with testing: %s", err)
		return
	}

	defer os.Remove(workdir)

	filename := path.Join(workdir, "hello-world")

	_, err = os.Stat(filename)
	if err == nil {
		t.Errorf("Test Bug: File shouldn't exist before we commit it")
		return
	}

	// Test new file creation
	check(t, filename, "Hello world!")

	_, err = os.Stat(filename)
	if err != nil {
		t.Errorf("Test Bug: File should exist at this point: %s", err)
		return
	}

	// Test atomic file replacement
	check(t, filename, "Put on your fancy pants!")
}

func TestMetadata(t *testing.T) {
	workdir, err := os.MkdirTemp("", "atomic-file")
	if err != nil {
		t.Errorf("During setup, failed to create a temporary directory to use with testing: %s", err)
		return
	}
	defer os.Remove(workdir)

	filename := path.Join(workdir, "hello-world")

	checkStat(t, filename,
		func(f *AtomicFile) error {
			return f.Chmod(0654)
		},
		func(i fs.FileInfo) error {
			if i.Mode() != 0654 {
				return fmt.Errorf("File mode expected to be %0o, but is %0o", 0654, i.Mode())
			}
			return nil
		},
	)
}

func TestWithoutCommit(t *testing.T) {
	workdir, err := os.MkdirTemp("", "atomic-file")
	if err != nil {
		t.Errorf("During setup, failed to create a temporary directory to use with testing: %s", err)
		return
	}

	defer os.Remove(workdir)

	filename := path.Join(workdir, "hello-world")

	_, err = os.Stat(filename)
	if err == nil {
		t.Errorf("Test Bug: File shouldn't exist before we commit it")
		return
	}

	f, err := New(filename)

	if err != nil {
		t.Errorf("New(%s) failed unexpectedly: %s", filename, err)
		return
	}

	input_bytes := []byte("Hello world")

	n, err := f.Write(input_bytes)
	if err != nil {
		t.Errorf("Write() expected to write %d bytes, but only %d were written: %s", len(input_bytes), n, err)
		return
	}

	_, err = os.ReadFile(filename)

	if err == nil {
		// An error is expected, this file should not exist because we did not Commit()
		t.Errorf("os.ReadFile should fail when an AtomicFile has not been Commit()'d.")
		return
	}

	err = f.Close()
	if err != nil {
		t.Errorf("Bug: Close() failed: %s", err)
		return
	}

	// Assert the temporary file path doesn't exist either.
	_, err = os.Stat(f.File.Name())
	if err == nil {
		t.Errorf("Bug: Temporary file name should not exist after Close()")
		return
	}
}

func FuzzMetadata(f *testing.F) {
	workdir, err := os.MkdirTemp("", "atomic-file")
	if err != nil {
		f.Errorf("During setup, failed to create a temporary directory to use with testing: %s", err)
		return
	}
	defer os.Remove(workdir)

	filename := path.Join(workdir, "hello-world")
	f.Add(0755, "hello-world")

	const minimal = 0400
	f.Fuzz(func(t *testing.T, perms int, _ string) {
		// Go's fuzzer has no concept(?) of os.FileMode, so in order to fuzz it,
		// We have to make sure the permissions are valid.
		// Permissions must have owner read, for example.
		mode := os.FileMode(perms&0777 | minimal)

		checkStat(t, filename,
			func(f *AtomicFile) error {
				//t.Logf("Chmod %#o", mode)
				return f.Chmod(mode)
			},
			func(i fs.FileInfo) error {
				if i.Mode() != mode {
					return fmt.Errorf("File mode expected to be %0o, but is %0o", mode, i.Mode())
				}
				return nil
			},
		)
	})
}

func check(t *testing.T, filename string, input string) {
	f, err := New(filename)

	if err != nil {
		t.Errorf("New(%s) failed unexpectedly: %s", filename, err)
		return
	}

	input_bytes := []byte(input)

	n, err := f.Write(input_bytes)
	//if n < len(input_bytes) {
	if err != nil {
		t.Errorf("Write() expected to write %d bytes, but only %d were written: %s", len(input_bytes), n, err)
		return
	}

	// Check that the target file doesn't already have our contents
	// This check assumes the tet suite isn't writing the same contents to an existing file.
	data, err := os.ReadFile(filename)
	if err != nil {
		// It's ok if reading failed, maybe the file doesn't exist.
	} else if bytes.Equal(data, input_bytes) {
		t.Errorf("Bug: Before commit, the file contents should not have been written.")
		return
	}

	err = f.Commit()
	if err != nil {
		t.Errorf("Bug: Commit() failed: %s", err)
		return
	}

	data, err = os.ReadFile(filename)

	if err != nil {
		t.Errorf("Bug: Error reading file after commit: %s", err)
		return
	}

	if !bytes.Equal(data, input_bytes) {
		t.Errorf("Bug: File content did not match what was written %v vs %v", string(data), string(input_bytes))
		return
	}

	// Assert the temporary file path doesn't exist either.
	_, err = os.Stat(f.File.Name())
	if err == nil {
		t.Errorf("Bug: Temporary file name should not exist after Close()")
		return
	}
}

func checkStat(t *testing.T, filename string, operation func(*AtomicFile) error, validate func(fs.FileInfo) error) {
	f, err := New(filename)
	if err != nil {
		t.Errorf("New(%s) failed unexpectedly: %s", filename, err)
		return
	}

	err = operation(f)
	if err != nil {
		t.Errorf("Test Bug: checkStat operation func returned error: %s", err)
		return
	}

	err = f.Commit()
	if err != nil {
		//st, _ := os.Stat(path.Dir(f.path))
		//t.Logf("Stat on dir: %#v", st)
		t.Errorf("Bug: Commit() failed for file %s: %s", f.path, err)
		return
	}

	stat, err := os.Stat(filename)
	if err != nil {
		t.Errorf("Test Bug: os.Stat failed: %s", err)
		return
	}

	err = validate(stat)
	if err != nil {
		t.Errorf("Bug: checkStat validation failed: %s", err)
		return
	}
}
