JAVA_HOME=/usr/lib/jvm/java-6-sun
LD_LIBRARY_PATH=$JAVA_HOME/jre/lib/amd64/server:$JAVA_HOME/jre/lib/amd64 \
gcc \
  -I/usr/lib/jvm/java-6-sun/include/linux \
  -I/usr/lib/jvm/java-6-sun/include \
  -L$JAVA_HOME/jre/lib/amd64 \
  -L$JAVA_HOME/jre/lib/amd64/server \
  testjava.c -lpthread -ljava

