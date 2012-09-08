config=$1
if [ -z "$config" ] ; then
  echo "Usage: $0 NUMBER"
  echo "0: test defaults"
  echo "1: disable _all"
  echo "2: store compress + disable _all"
  echo "3: store compress w/ snappy + disable _all"
  echo "4: remove @message (simulate 'apache logs in json')"
fi

template() {
  curl -XPUT http://localhost:9200/_template/logtemplate -d "$1"
}

case $config in
  1|2|3|4) 
    template ' {
      "template": "logstash-*"
      "settings": {
        "number_of_shards": 5 ,
        "index.compress.stored": true,
        "index.query.default_field": "@message",
      },
      "mappings": { "_default_": { "_all": { "enabled": false } } }
    }'
    ;;
esac

sh es.sh $config.yml&
es_pid=$!
trap "kill -TERM $es_pid" EXIT

logstash="ruby --1.9 $HOME/projects/logstash/bin/logstash"
time $logstash agent -f apache.logstash.conf


