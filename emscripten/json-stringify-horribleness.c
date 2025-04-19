// emcc test.c -o test.js -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE='$UTF8ToString'
#include <stdio.h>
#include <emscripten.h>

int main() {

  struct player {
    char *name;
    int id;
  } foo;

  foo.name = " \"hack me\"; --Fancy pants";
  foo.id = 0;
  EM_ASM({
    console.log(JSON.stringify({
      name: UTF8ToString($0),
      id: $1
    }));
  }, foo.name, foo.id);

  return 0;
}
