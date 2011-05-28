#include <regex.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>


int main(int argc, char **argv) {
  regex_t re;

  if (argc != 3) {
    printf("usage: regexp stringtotest\n");
    return 1;
  }

  argv++; // skip $0

  char *re_str, *string;

  re_str = *argv++;
  string = *argv++;
   
  printf("Re: %s\n", re_str);
  printf("test: %s\n", string);

  regcomp(&re, re_str, REG_EXTENDED | REG_ICASE | REG_NOSUB);
  if (regexec(&re, string, 0, NULL, 0) == 0) {
    printf("Match\n");
  } else {
    printf("Fail\n");
  }

  return 0;


}
