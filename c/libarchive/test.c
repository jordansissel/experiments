#include <archive.h>
#include <archive_entry.h>
#include <stdio.h>
#include <sys/stat.h>

int main(int argc, char *argv[0]) {
  int r;
  ssize_t size;

  const char *filename = argv[1];
  struct archive *a = archive_read_new();
  archive_read_support_filter_all(a);
  archive_read_support_format_raw(a);
  r = archive_read_open_filename(a, filename, 16384);
  if (r != ARCHIVE_OK) {
    /* ERROR */
  }

  struct archive_entry *ae;
  r = archive_read_next_header(a, &ae);
  if (r != ARCHIVE_OK) {
    /* ERROR */
  }

  char buff[8192];
  size_t buffsize = sizeof(buff);
  for (;;) {
    size = archive_read_data(a, buff, buffsize);
    if (size < 0) {
      /* ERROR */
    }
    if (size == 0)
      break;
    write(1, buff, size);
  }

  archive_read_free(a);
}
