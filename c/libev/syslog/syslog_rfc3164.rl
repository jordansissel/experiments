#include <stdio.h>
#include <string.h>
%%{
  machine syslog_rfc3164;

  action initialize {
    /* nothing */
  }

  pri = ( "<" [0-9]{1,3} ">" ) %{ message = p; };
  message = ( any - "\n" )+;

  RFC3164 =
    pri message
    | message
  ;
  main := ( RFC3164 )*;
}%%

int main(int argc, char **argv) {
  %%write data;
  const char *p = argv[1];
  const char *message = p;
  const char *pe = p + strlen(p);
  char *ts = NULL;
  int cs;
  const char *eof = NULL;

  printf("Parsing: %s\n", p);

  %%write init;
  %%write exec;

  printf("Message: %s\n", message);

  return 0;
}
