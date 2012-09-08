config=$1
if [ -z "$config" ] ; then
  echo "Usage: $0 NUMBER"
  echo "0: test defaults"
  echo "1: disable _all"
  echo "2: 1 + store compression = LZW "
  echo "3: 1 + store compression = Snappy"
  echo "4: 3 + remove @message and @source (simulate 'apache logs in json')"
fi

template() {
  while ! curl -XPUT http://localhost:9200/_template/logtemplate -d "$1" ; do
    echo "Waiting for ES to come up"
    sleep 1
  done
}

rm -rf /data/jls/millionlogstest/$config.yml/
sh es.sh $config.yml&
es_pid=$!
trap "kill -TERM $es_pid" EXIT

case $config in
  1|2|3|4) 
    template '{
      "template": "logstash-*",
      "settings": {
        "number_of_shards": 5,
        "index.compress.stored": true,
        "index.query.default_field": "@message"
      },
      "mappings": { "_default_": { "_all": { "enabled": false } } }
    }'
    ;;
esac

logstashconf=apache.logstash.conf
if [ $config -eq 4 ] ; then
  logstashconf=apache-stripmsg.logstash.conf
fi

logstash="ruby --1.9 $HOME/projects/logstash/bin/logstash"
time $logstash agent -f $logstashconf

curl -s http://localhost:9200/_flush
curl -s http://localhost:9200/_optimize

