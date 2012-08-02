#include <jansson.h>
#include <unistd.h>

int main() {
  for (int i = 0; i < 10000000; i++) {
    json_t *j, *str;
    j = json_object();
    json_object_set(j, "Hello", str = json_string("foobar"));
    json_decref(str);
    json_decref(str);
    json_decref(j);
  }
  return 0;
}
