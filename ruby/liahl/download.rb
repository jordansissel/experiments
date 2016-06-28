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
    sleep(0.5)
    time("fetch #{args.first}") do
      Kernel::open(*args)
    end
  end

  def index(url)
    es = Elasticsearch::Client.new(host: elasticsearch_url)
    document_id = Digest::SHA256.hexdigest(url)

    begin
      document = time("cache check | #{url}") do
        es.get(index: elasticsearch_index, id: document_id)
      end
      document["_source"]["content"]
    rescue Elasticsearch::Transport::Transport::Errors::NotFound
      content = open(url, HTTP_HEADERS).read.force_encoding(Encoding::UTF_8).encode(Encoding::UTF_8, :invalid => :replace, :undef => :replace)
      es.index(index: elasticsearch_index,
               type: "web", 
               id: document_id,
               body: {
                 fetched_at: Time.now.iso8601(3),
                 url: url,
                 content: content
               })
      content
    end
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

    false && stats_links.each_with_index do |link|
      level = levels.shift
      href = link.attributes["href"].value
      url = base_url + "/" + href
      index(url)
    end

    # Download all the current score sheets
    doc.xpath("//a[contains(@href, 'display-schedule.php')]").each do |link|
      team = link.text
      href = link.attributes["href"].value
      url = base_url + "/" + href
      schedule_content = index(url)

      schedule = Nokogiri::HTML(schedule_content)
      schedule.xpath("//a[contains(@href,'oss-scoresheet')]").each do |game_link|
        game_href = game_link.attributes["href"].value
        game_url = base_url + "/" + game_href
        puts game_url
        index(game_url)
      end
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
