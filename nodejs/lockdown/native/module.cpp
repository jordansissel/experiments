#include <v8.h>
#include <node.h>
#include <stdio.h>
#include <lockdown.h>

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

void Lockdown(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  int v = lockdown();

  args.GetReturnValue().Set(String::NewFromUtf8(isolate, "lockdown"));
}

void init(Local<Object> exports) {
  NODE_SET_METHOD(exports, "lockdown", Lockdown);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init)
