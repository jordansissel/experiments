#include <jni.h>
#include <stdio.h>
#include "Thing.h"
 
// Implementation of native method sayHello() of HelloJNI class
JNIEXPORT void JNICALL Java_Thing_thing0(JNIEnv *env, jobject thisObj) {
   printf("thing0\n");
   return;
}
