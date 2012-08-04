#include <stdio.h>
#include <string.h>

int main(int argc, char **argv) {
  char *data = strdup(argv[1]);
  char *orig = data;
  char *line;
  size_t len = strlen(orig);

  while ((line = strsep(&data, " ")) != NULL) {
    if (data == NULL) {
      printf("Dangle: %s\n", line);
    } else {
      printf("line: %s\n", line);
    }
  }

  return 0;
}
