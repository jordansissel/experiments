for i in 12.04 12.10 13.04 13.10 ; do 
  docker build -t jordansissel/system:ubuntu-$i $i
done
