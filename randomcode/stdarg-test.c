#include <stdio.h>
#include <stdarg.h>

void func1(int a, int b, int c) {
  printf("func1!: %d %d %d\n", a, b, c);
}

void func2(int a, int b, int c) {
  printf("func2!: %d %d %d\n", a, b, c);
}

void call(int a, ...) {
  va_list args;
  va_start(args, a);
  func1(args);
  va_end(args);
}

int main() {
  call(1,2,3);
  return 0;
}
