#include <stdio.h>
#include <string.h>
%%{
  machine syslog_rfc3164;

  action initialize {
    /* nothing */
  }

  pri = ( "<" [0-9]{1,3} ">" ) @{ printf("pri; %c\n", *p); };
  message = ( any - "\n" )+ @{ printf("message; %c\n", *p); };

  RFC3164 =
    pri message
  ;
  main := ( RFC3164 )*;
}%%

int main(int argc, char **argv) {
  %%write data;
  const char *p = argv[1];
  const char *pe = p + strlen(p);
  char *ts = NULL;
  int cs;
  const char *eof = NULL;

  printf("Parsing: %s\n", p);

  %%write init;
  %%write exec;

  return 0;
}
