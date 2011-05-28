#include <jni.h>
#include <stdio.h>
#include "JNIHelperExample.h"

JNIEXPORT void JNICALL 
Java_JNIHelperExample_abort(JNIEnv *env, jobject obj)
{
  abort(); /* see abort(3) manpage */
  return;
}

