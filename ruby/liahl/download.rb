require "nokogiri"
require "open-uri"
require "elasticsearch"
require "digest"
require "time"
require "clamp"

class LIAHLDownload < Clamp::Command
  HTTP_HEADERS = {
    "User-Agent" => "liahl stats fetcher (Contact me jls@semicomplete.com if this script is causing problems)"
  }

  option "--elasticsearch-url", "URL", "Elasticsearch url", required: true
  option "--elasticsearch-index", "INDEX", "Elasticsearch index", default: "hockey-scrape"

  def time(text, &block)
    start = Time.now
    value = block.call
    duration = Time.now - start
    puts(format("time> %.2f | %s", duration, text))
    value
  end

  def open(*args)
    sleep(1)
    time("fetch #{args.first}") do
      Kernel::open(*args)
    end
  end

  def index(*urls)
    es = Elasticsearch::Client.new(host: elasticsearch_url)
    ids = urls.collect { |url| Digest::SHA256.hexdigest(url) }

    begin
      result = time("cache check #{urls.count} pages #{urls.first if urls.count == 1}") do
        es.mget(index: elasticsearch_index, body: { ids: ids })
      end

      begin
        missing = result["docs"].reject { |doc| doc["found"] }

        # Expire certain pages after a given time period.
        expire_time = Time.now - 60*60*24

        missing += result["docs"].select do |doc| 
          next unless doc["found"]
          next unless doc["_source"]["url"] =~ /display-schedule/
          time = Time.parse(doc["_source"]["fetched_at"])
          puts "Expired: #{time < expire_time} / #{expire_time} / #{time} / #{doc["_source"]["url"] }"
          time < expire_time
        end

        pages = result["docs"].select { |doc| doc["found"] }.collect { |doc| doc["_source"]["content"] }

        if missing.any?
          missing_ids = missing.collect { |m| m["_id"] }
          missing_urls = Hash[ids.zip(urls)].select { |k,v| missing_ids.include?(k) }.values
          pages += download(es, *missing_urls)
        end
      rescue => e
        require "pry"
        binding.pry
      end

      if urls.count == 1
        pages.first
      else
        pages
      end
    end
  end

  def download(es, *urls)
    puts "Downloading #{urls.count} pages"
    pages = urls.collect do |url|
      begin
        open(url, HTTP_HEADERS).read.force_encoding(Encoding::UTF_8).encode(Encoding::UTF_8, :invalid => :replace, :undef => :replace)
      rescue => e
        puts "Fetch failed #{url}"
        sleep 5
        retry
      end
    end

    bulk = pages.zip(urls).collect do |content, url|
      [ 
        { index: { _index: elasticsearch_index, _type: "web", _id: Digest::SHA256.hexdigest(url) } },
        { fetched_at: Time.now.iso8601(3), url: url, content: content }
      ]
    end.flatten

    resp = es.bulk(body: bulk)
    if resp["errors"]
      logger.error("Errors occurred uploading bulk.")
      require "pry"
      binding.pry
    end
    pages
  rescue => e
    require "pry"
    binding.pry
  end

  def process_season(season)
    puts "Fetching season #{season}"
    base_url = "http://stats.liahl.org"
    stats_main = "#{base_url}/display-stats.php?league=1&season=#{season}"

    id = Digest::SHA256.hexdigest(stats_main)

    content = index(stats_main)

    # Parse the player stats links
    doc = Nokogiri::HTML(content)
    stats_links = doc.xpath("//a[contains(text(),'Player Stats')]")
    levels = doc.xpath("//a[contains(text(), 'Player Stats')]/../../preceding-sibling::tr[1]").collect(&:text)

    # Download all the current score sheets
    doc.xpath("//a[contains(@href, 'display-schedule.php')]").each do |link|
      team = link.text
      href = link.attributes["href"].value
      url = base_url + "/" + href
      schedule_content = index(url)

      schedule = Nokogiri::HTML(schedule_content)
      urls = schedule.xpath("//a[contains(@href,'oss-scoresheet')]").collect do |game_link|
        game_href = game_link.attributes["href"].value
        game_url = base_url + "/" + game_href
      end
      index(*urls)
    end

  rescue => e
    puts "Failure fetching season #{season}: #{e}"
    raise
  end

  def execute
    seasons = (35..35)
    seasons.each do |s| 
      process_season(s)
    end
  end
end

LIAHLDownload.run(ARGV)
