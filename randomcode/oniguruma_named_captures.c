/* Released under the BSD license.
 *
 * Author: Jordan Sissel
 * http://www.semicomplete.com/
 *
 * This file is an example of how to use oniguruma with named captures.
 * It is written against oniguruma4.
 */

#include <sys/types.h>
#include <stdio.h>

#include <oniguruma.h>

struct data {
  OnigRegion *region;
  UChar *str;
};

//int name_callback(UChar *name, UChar *end, int ngroups, int *group_list, regex_t *re, void *arg) {
int name_callback(const OnigUChar *name, const OnigUChar *end, int ngroups, int *group_list, OnigRegex re, void *arg) {
  struct data *d = (struct data *)arg;
  OnigRegion *region = d->region;
  UChar *str = d->str;
  int num;
  num = onig_name_to_backref_number(re, name, end, region);
  printf("%.*s = %.*s\n", end - name, name, region->end[num] - region->beg[num],
         (str + region->beg[num]));
  return 0;
}

int main(int argc, char **argv) {
  OnigRegex re;
  OnigRegion *region;
  OnigErrorInfo errinfo;
  int r;
  char *pattern = strdup("^(?<test>.*?)( (?<word2>.*))?$");
  char *str;
  if (argc == 2) {
    str = strdup(argv[1]);
  } else {
    str = strdup("hello there");
  }
  r = onig_new(&re, (const OnigUChar *)pattern, 
              (const OnigUChar *)(pattern + strlen(pattern)),
              ONIG_OPTION_DEFAULT, ONIG_ENCODING_UTF8, ONIG_SYNTAX_DEFAULT, 
              &errinfo);
  printf("Ret: %d\n", r);
  if (r != ONIG_NORMAL) {
    char s[ONIG_MAX_ERROR_MESSAGE_LEN];
    onig_error_code_to_str((UChar* )s, r);
    fprintf(stderr, "Error: %s\n", s);
    return 1;
  }

  region = onig_region_new();
  
  r = onig_search(re, (UChar *)str, (UChar *)(str + strlen(str)),
                  (UChar *)str, (UChar *)(str + strlen(str)),
                  region, ONIG_OPTION_NONE);

  if (r < ONIG_MISMATCH) {
    char s[ONIG_MAX_ERROR_MESSAGE_LEN];
    onig_error_code_to_str((UChar* )s, r);
    fprintf(stderr, "Error: %s\n", s);
    return 1;
  }

  printf("Match?\n");
  struct data d;
  d.region = region;
  d.str = str;
  onig_foreach_name(re, name_callback, (void *)(&d));
  free(str);
}

