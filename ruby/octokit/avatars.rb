require "clamp"
require "time"
require "json"
require "elasticsearch"
require "stud/try"
require "set"

class Time
  def to_json(*args)
    iso8601(3).to_json
  end
end

START_TIME = Time.now

class Avatars < Clamp::Command
  option "--elasticsearch-host", "ELASTICSEARCH_HOST", "The elasticsearch host. This can be a full url like `https://user:pass@host:port/` if you need to use SSL and authentication such as with Elastic Shield.", :required => true

  def execute
    es = Elasticsearch::Client.new(host: elasticsearch_host)
    r = es.search(index: "github-comments", scroll: "1m", q: "created_at:[2017-03-04 TO *]", size: 1000, _source: [ "user.avatar_url" ])
    avatars = Set.new
    while r["hits"]["hits"].any?
      r["hits"]["hits"].each do |hit|
        avatars.add(hit["_source"]["user"]["avatar_url"])
      end
      r = es.scroll(scroll: "1m", scroll_id: r["_scroll_id"])
    end

    puts "<!DOCTYPE html><html><body>"
    avatars.to_a.shuffle.each do |avi|
      puts "<img src='#{avi}&s=88' width='88' height='88'>\n"
    end
    puts "</body></html>"
  end
end

Avatars.run
