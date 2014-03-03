for i in 6.0.8 7.3 ; do
  docker build -t jordansissel/system:debian-$i $i
done
