#include <ruby.h>

typedef struct foo foo_t;
struct foo {
  char *str;
  long length;
};

VALUE cFoo;

void rFoo_free(void *p) {
  /* nothing */
}

VALUE rFoo_new(VALUE klass) {
  VALUE r_foo;
  foo_t *c_foo = ALLOC(foo_t);
  c_foo->str = NULL;
  c_foo->length = 0;
  r_foo = Data_Wrap_Struct(klass, 0, rFoo_free, c_foo);
  rb_obj_call_init(r_foo, 0, 0);
  return r_foo;
}

VALUE rFoo_str_set(VALUE self, VALUE string) {
  foo_t *c_foo = NULL;
  Data_Get_Struct(self, foo_t, c_foo);
  c_foo->str = rb_str2cstr(string, &(c_foo->length));
  return string;
}

VALUE rFoo_str_get(VALUE self) {
  foo_t *c_foo = NULL;
  Data_Get_Struct(self, foo_t, c_foo);
  return rb_str_new(c_foo->str, c_foo->length);
  //return Qnil;
}

void Init_Foo() {
  cFoo = rb_define_class("Foo", rb_cObject);
  rb_define_singleton_method(cFoo, "new", rFoo_new, 0);
  rb_define_method(cFoo, "str=", rFoo_str_set, 1);
  rb_define_method(cFoo, "str", rFoo_str_get, 0);
}
