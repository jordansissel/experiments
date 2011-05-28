#include <pcre.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

int foo(pcre_callout_block *pcb) {
  int capture = pcb->capture_last;
  int start, end;

  char *thing;
  long num;

  start = pcb->offset_vector[capture * 2];
  end = pcb->offset_vector[capture * 2 + 1];

  thing = malloc(end - start);

  memcpy(thing, pcb->subject + start, end - start);
  printf("%d: (%d,%d) %.*s\n", capture,
         start, end, end - start,
         pcb->subject + start);

  num = strtol(thing, NULL, 0);

  return (num <= 5);
}

int main(int argc, const char **argv) {
  pcre *re;
  pcre_callout = foo;
  int *ovector = NULL;
  int num_captures = -1;
  const char *errptr;
  int erroffset;
  size_t capalloc = 0;

  re = pcre_compile("(?<foo>[0-9]+)(?C0)()(?<bar>.*)(?C0)", 
                    0, &errptr, &erroffset, NULL);

  if (re == NULL) {
    printf("regex error: %s\n", errptr);
    return 1;
  }

  pcre_fullinfo(re, NULL, PCRE_INFO_CAPTURECOUNT, &num_captures);
  printf("'foo' == %d\n", pcre_get_stringnumber(re, "foo"));
  printf("'bar' == %d\n", pcre_get_stringnumber(re, "bar"));
  num_captures++; /* include match group 0 */

  capalloc = ((3 * num_captures) * sizeof(int));
  ovector = malloc(capalloc);
  memset(ovector, 0, capalloc);

  if (argc != 2) {
    printf("Usage: $0 <string>\n");
    return 1;
  }

  pcre_exec(re, NULL, argv[1], strlen(argv[1]), 0, 0, ovector, num_captures * 3);

  return 0;

}
