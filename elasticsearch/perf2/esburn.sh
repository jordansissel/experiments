#rm logstash-1.1.10-monolithic.jar
#wget -q --secure-protocol=tlsv1  https://logstash.objects.dreamhost.com/release/logstash-1.1.10-monolithic.jar

for i in 1 2 3 4 5 6 7; do
  java -Djava.io.tmpdir=/home/logstash/tmp -jar logstash-1.1.10-monolithic.jar \
    agent -e '
  input {
    generator { threads => 4 message => "this is a sample log - tcpdump: listening on eth0, link-type EN10MB (Ethernet), capture size 65535 bytes" type => foo }
  }
  output { elasticsearch_http { flush_size => 10000 host => localhost } }
  ' &
done

wait
