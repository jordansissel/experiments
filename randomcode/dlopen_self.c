/* compile with:
 * gcc -rdynamic -ldl -o dlopen_self dlopen_self.c
 */

#include <stdio.h>
#include <dlfcn.h>

void foo() { printf("Hello\n"); }

int main() {
  void *handle = NULL;
  void (*myfunc)(void) = NULL;

  //handle = dlopen(NULL, RTLD_LAZY);
  handle = dlopen("/lib64/libc.so.6", RTLD_LAZY);
  //myfunc = dlsym(handle, "foo");
  //if (myfunc == NULL) {
    //printf("e: %s\n", dlerror());
  //} else {
    //myfunc();
  //}
  return 0;
}
