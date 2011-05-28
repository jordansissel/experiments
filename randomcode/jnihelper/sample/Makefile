JAVA_HOME?=/usr/lib/jvm/java-6-sun
MACHINE?=amd64
LD_LIBRARY_PATH=$(JAVA_HOME)/jre/lib/$(MACHINE)/server:$(JAVA_HOME)/jre/lib/$(MACHINE) 

default: JNIHelperExample.class

libJNIHelperExample.so: JNIHelperExample.c
	JAVA_HOME=$(JAVA_HOME) \
  LD_LIBRARY_PATH=$(LD_LIBRARY_PATH) \
		gcc -fPIC -shared -Wl,-soname=$@ \
			-shared \
			-I/usr/lib/jvm/java-6-sun/include/linux \
			-I/usr/lib/jvm/java-6-sun/include \
			-L$(JAVA_HOME)/jre/lib/$(MACHINE) \
			-L$(JAVA_HOME)/jre/lib/$(MACHINE)/server \
			$< -o $@

JNIHelperExample.class: JNIHelperExample.java libJNIHelperExample.so
	javac $<
