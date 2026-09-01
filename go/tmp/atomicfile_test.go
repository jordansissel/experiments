package tmp
import (
	"testing"
	"path"
	"os"
	"bytes"
)

func TestAtomic(t *testing.T) {
	workdir, err := os.MkdirTemp("", "atomic-file")
	if err != nil {
		t.Errorf("During setup, failed to create a temporary directory to use with testing: %s", err)
		return
	}

	defer os.Remove(workdir)

	filename := path.Join(workdir, "hello-world")

	// Test new file creation
	check(t, filename, "Hello world!")

	// Test atomci file overwriting
	check(t, filename, "Put on your fancy pants!")
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
	// This check assumes the test suite isn't writing the same contents to an existing file.
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
	defer os.Remove(filename)

	data, err = os.ReadFile(filename)

	if err != nil {
		t.Errorf("Bug: Error reading file after commit: %s", err)
		return
	}

	if !bytes.Equal(data, input_bytes) {
		t.Errorf("Bug: File content did not match what was written %v vs %v", string(data), string(input_bytes))
		return
	}
}
