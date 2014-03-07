for i in 6.4 ; do
  docker build -t jordansissel/system:centos-$i $i
done
