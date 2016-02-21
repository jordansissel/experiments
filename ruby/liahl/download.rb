require "nokogiri"
require "open-uri"
require "elasticsearch"
require "digest"
require "time"
require "clamp"

class LIAHLDownload < Clamp::Command
  option "--elasticsearch-url", "URL", "Elasticsearch url", required: true
  option "--elasticsearch-index", "INDEX", "Elasticsearch index", default: "hockey-scrape"

  def index(url, content)
    es = Elasticsearch::Client.new(host: elasticsearch_url)
    es.index(index: elasticsearch_index, type: "web", 
      id: Digest::SHA256.hexdigest(url),
      body: {
        fetched_at: Time.now.iso8601(3),
        url: url,
        content: content
      })
  end

  def process_season(season)
    puts "Fetching season #{season}"
    base_url = "http://stats.liahl.org"
    stats_main = "#{base_url}/display-stats.php?league=1&season=#{season}"
    dir = "seasons/#{season}"

    id = Digest::SHA256.hexdigest(stats_main)

    content = open(stats_main).read.force_encoding(Encoding::UTF_8).encode(Encoding::UTF_8, :invalid => :replace, :undef => :replace)
    index(stats_main, content)

    # Parse the player stats links
    doc = Nokogiri::HTML(content)
    stats_links = doc.xpath("//a[contains(text(),'Player Stats')]")
    levels = doc.xpath("//a[contains(text(), 'Player Stats')]/../../preceding-sibling::tr[1]").collect(&:text)

    stats_links.each_with_index do |link|
      level = levels.shift
      href = link.attributes["href"].value
      url = base_url + "/" + href
      puts url
      uri = URI.parse(url)
      division_stats_content = open(url).read.force_encoding(Encoding::UTF_8).encode(Encoding::UTF_8, :invalid => :replace, :undef => :replace)
      query = CGI.parse(URI.parse(url).query)
      index(url, division_stats_content)
      sleep(0.500)
    end
  rescue => e
    puts "Failure fetching season #{season}: #{e}"
    raise
  end

  def execute
    seasons = (1..33)
    seasons.each do |s| 
      process_season(s)
    end
  end
end

LIAHLDownload.run(ARGV)
