config=$1
if [ -z "$config" ] ; then
  echo "Usage: $0 NUMBER"
  echo "0: test defaults"
  echo "1: disable _all"
  echo "2: 1 + store compression = LZW "
  echo "3: 1 + store compression = Snappy"
  echo "4: 3 + remove @message and @source"
  echo "5: 3 + remove all superfluous fields (simulate 'apache logs in json')"
  echo "6: 5 + grok { singles => true }"
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
  0) ;; # do nothing
  1|2|3|4|5|6) 
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
  7)
    template '{
      "template": "logstash-*",
      "settings": {
        "number_of_shards": 5,
        "number_of_replicas": 0,
        "index.compress.stored": true,
        "index.query.default_field": "@message"
      },
      "mappings": { 
        "_default_": { 
          "_all": { "enabled": false },
          "@fields": { "type": "object", "dynamic": true, "path": "full" },
          "@message" : { "type" : "string", "index" : "analyzed" },
          "@source" : { "type" : "string", "index" : "not_analyzed" },
          "@source_host" : { "type" : "string", "index" : "not_analyzed" },
          "@source_path" : { "type" : "string", "index" : "not_analyzed" },
          "@tags": { "type": "string", "index" : "not_analyzed" },
          "@timestamp" : { "type" : "date", "index" : "not_analyzed" },
          "@type" : { "type" : "string", "index" : "not_analyzed" }
        } 
      }
    }'
esac

case $config in
  4) logstashconf=apache-stripmsg.logstash.conf ;;
  5) logstashconf=apache-strippointless.logstash.conf ;;
  6) logstashconf=apache-singles.logstash.conf ;;
  7) logstashconf=apache-strippointless.logstash.conf ;;
  *) logstashconf=apache.logstash.conf ;;
esac

logstash="ruby --1.9 $HOME/projects/logstash/bin/logstash"
time $logstash agent -f $logstashconf

curl -s http://localhost:9200/_flush
curl -s http://localhost:9200/_optimize

