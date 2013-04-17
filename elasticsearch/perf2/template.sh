#!/bin/sh
# Run this against an elasticsearch cluster.

curl -XPUT http://localhost:9200/_template/logstash-template -d '
{
  "template": "logstash-*",
  "settings": {
    "index.merge.policy.max_merged_segment": "5g",
    "index.refresh_interval": "-1",
    "index.store.compress.stored": true,
    "index.store.compress.tv": true,
    "index.term_index_divisor": 1,
    "index.term_index_interval": 128,
    "number_of_replicas": 1,
    "number_of_shards": 5
  },
  "mappings" : {
      "_default_" : {
          "_all" : {"enabled" : true},
          "properties" : {
             "@fields" : {
                  "type" : "object",
                  "dynamic": true,
                  "path": "full",
                  "properties" : {
                      "lumberjack": { "type": "string", "index": "not_analyzed" },
                      "clientip" : { "type": "ip" },
                      "geoip" : {
                          "type" : "object",
                          "dynamic": true,
                          "path": "full",
                          "properties" : {
                                  "area_code" : { "type": "string", "index": "not_analyzed" },
                                  "city_name" : { "type": "string", "index": "not_analyzed" },
                                  "continent_code" : { "type": "string", "index": "not_analyzed" },
                                  "country_code2" : { "type": "string", "index": "not_analyzed" },
                                  "country_code3" : { "type": "string", "index": "not_analyzed" },
                                  "country_name" : { "type": "string", "index": "not_analyzed" },
                                  "dma_code" : { "type": "string", "index": "not_analyzed" },
                                  "ip" : { "type": "string", "index": "not_analyzed" },
                                  "latitude" : { "type": "float", "index": "not_analyzed" },
                                  "longitude" : { "type": "float", "index": "not_analyzed" },
                                  "metro_code" : { "type": "float", "index": "not_analyzed" },
                                  "postal_code" : { "type": "string", "index": "not_analyzed" },
                                  "region" : { "type": "string", "index": "not_analyzed" },
                                  "region_name" : { "type": "string", "index": "not_analyzed" },
                                  "timezone" : { "type": "string", "index": "not_analyzed" }
                          }
                      }
                  }
             },
             "@message": { "type": "string", "index": "analyzed" },
             "@source": { "type": "string", "index": "not_analyzed" },
             "@source_host": { "type": "string", "index": "not_analyzed" },
             "@source_path": { "type": "string", "index": "not_analyzed" },
             "@timestamp": { "type": "date", "index": "not_analyzed" },
             "@type": { "type": "string", "index": "not_analyzed" }
          }
      }
  }
}
'
