#include <tcutil.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>
#include <sys/types.h>
#include <string.h>

struct foo {
  int one;
  double two;
  char *three;
};


int main() {
  TCTREE *tree = NULL;
  tree = tctreenew();
  struct foo *f = malloc(sizeof(struct foo));
  f->one = 100;
  f->two = 1.1111;
  f->three = "Hello world";
  tctreeput(tree, "foo", 3, f, sizeof(struct foo));

  f->one = 200;
  tctreeiterinit(tree);
  const char *key;
  while (key = tctreeiternext2(tree)) {
    const struct foo *val;
    int size;
    val = tctreeget(tree, key, strlen(key), &size);
    printf("%s: one=%d\n", key, val->one);
    printf("%s: two=%f\n", key, val->two);
    printf("%s: three=%s\n", key, val->three);
    printf("%s: struct member 'three' is same pointer: %d\n", key, val->three == f->three);
    printf("ptreq: %d\n", f == val);
    printf("ptr orig: %ld\n", (long)f);
    printf("ptr val: %ld\n", (long) val);
  }
  tctreedel(tree);
  return 0;
}
