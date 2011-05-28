#include <tcutil.h>
#include <tcbdb.h>
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
  TCBDB *db = NULL;
  db = tcbdbnew();
  struct foo *f = malloc(sizeof(struct foo));
  f->one = 100;
  f->two = 1.1111;
  f->three = "Hello world";
  printf("put: %d\n", tcbdbput(db, "foo", 3, f, sizeof(struct foo)));

  char *key;
  BDBCUR *cursor;
  cursor = tcbdbcurnew(db);
  tcbdbcurfirst(cursor);
  while ((key = tcbdbcurkey2(cursor)) != NULL) {
    struct foo *val;
    int size;
    val = tcbdbcurval(cursor, &size);
    printf("%s: one=%d\n", key, val->one);
    printf("%s: two=%f\n", key, val->two);
    printf("%s: three=%s\n", key, val->three);
    printf("%s: struct member 'three' is same pointer: %d\n", key, val->three == f->three);
    printf("ptreq: %d\n", f == val);
    printf("ptr orig: %ld\n", (long)f);
    printf("ptr val: %ld\n", (long) val);
  }
  tcbdbdel(db);
  return 0;
}
