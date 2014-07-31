. ./versions.rc
for i in $versions; do 
  docker build -t jordansissel/system:ubuntu-$i $i
done
