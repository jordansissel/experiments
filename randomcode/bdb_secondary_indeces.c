#include <db.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct user {
  char user[20];
  int uid;
  char path[100];
} user_t;

int byuid_callback(DB *secondary, const DBT *key, 
                   const DBT *data, DBT *result) {
  user_t *u = ((user_t *)data->data);
  printf("Generating secondary index key for user '%s'", u->user);
  result->data = &(u->uid);
  result->size = sizeof(u->uid);
  return 0;
}

int main() {
  DB *db;
  DB *uiddb;
  int ret;

  db_create(&db, NULL, 0);
  db->open(db, NULL, NULL, "data", DB_BTREE, DB_CREATE, 0);

  db_create(&uiddb, NULL, 0);
  uiddb->open(uiddb, NULL, NULL, "byuid", DB_BTREE, DB_CREATE, 0);

  ret = db->associate(db, NULL, uiddb, byuid_callback, 0);
  printf("associate: %d\n", ret);

  user_t u;
  strcpy(u.user, "jls");
  u.uid = 1000;
  strcpy(u.path, "/home/jls");

  DBT key, value;
  memset(&key, 0, sizeof(DBT));
  memset(&value, 0, sizeof(DBT));
  key.data = u.user;
  key.size = strlen(u.user);

  value.data = &u;
  value.size = sizeof(u);

  ret = db->put(db, NULL, &key, &value, 0);
  printf("put: %d\n", ret);

  memset(&value, 0, sizeof(value));
  ret = db->get(db, NULL, &key, &value, 0);
  printf("put: %d\n", ret);
  printf("Uid: %d\n", ((user_t*)value.data)->uid);

  memset(&value, 0, sizeof(value));
  int uid = 1000;
  key.data = &uid;
  key.size = sizeof(int);

  uiddb->get(uiddb, NULL, &key, &value, 0);
  printf("Secondary lookup: user=%s\n", ((user_t*)value.data)->user);

  return 0;
}
