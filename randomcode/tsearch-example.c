
#include <search.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>


typedef struct foo {
  const char *name;
  int value;
} foo_t;

int cmp(const void *a, const void *b) {
  foo_t *fa, *fb;

  fa = (foo_t*)a;
  fb = (foo_t*)b;
  return strcmp(fa->name, fb->name);
}

void walker(const void *node, const VISIT which, const int depth) {
  foo_t *f;
  f = *(foo_t **)node;
  printf("%s: %d\n", f->name, f->value);
}

int main() {
  int i, *ptr;
  void *root = NULL;
  const void *ret;
  foo_t *val, *val2;

  val = calloc(1, sizeof(foo_t));
  val->name = strdup("one");
  val->value = 1;
  printf("name: %s\n", val->name);
  ret = tsearch(val, &root, cmp);
  printf("retname: %s\n", (*(foo_t **)ret)->name);

  val2 = calloc(1, sizeof(foo_t));
  val2->name = strdup(val->name);
  val2->value = 3;
  printf("name: %s\n", val->name);
  ret = tsearch(val, &root, cmp);
  printf("val2 result: %d\n", (*(foo_t **)ret)->value);

  printf("Walking with twalk\n");
  twalk(root, walker);
  return 0;

}

  
