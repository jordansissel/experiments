require "nokogiri"
require "elasticsearch"

def fetch(url)
  es = Elasticsearch::Client.new
  id = Digest::SHA256.hexdigest(url)
  result = es.get(index: "hockey-scrape", id: Digest::SHA256.hexdigest(url))
  result["_source"]["content"]
end

def process_season(season)
  es = Elasticsearch::Client.new
  base_url = "http://stats.liahl.org"
  puts "Fetching season #{season}"
  stats_main = "#{base_url}/display-stats.php?league=1&season=#{season}"

  doc = Nokogiri::HTML(fetch(stats_main))
  stats_links = doc.xpath("//a[contains(text(),'Player Stats')]")

  levels = doc.xpath("//a[contains(text(), 'Player Stats')]/../../preceding-sibling::tr[1]").collect(&:text)

  player_stats = {}
  goalie_stats = {}
  stats_links.each_with_index do |link|
    level = levels.shift
    href = link.attributes["href"].value
    $stdout.write("#{level}: ")
    $stdout.flush

    url = base_url + "/" + href
    division_stats = Nokogiri::HTML(fetch(url))
    season = href[/season=\d+/].split("=").last
    level_num = href[/level=\d+/].split("=").last


    player_entries = division_stats.xpath("//table[contains(*//th/text(), 'Player Stats')]//tr[td]")
    bulk = []

    player_entries.each do |player_doc|
      cells = player_doc.children
      name = cells[0].text
      number = cells[1].text
      team = cells[2].text
      games = cells[3].text
      goals = cells[4].text
      assists = cells[5].text
      penalty_time = cells[6].text
      player_stats["#{name}:#{number}"] = entry = {
        id: [name, number, team, season].join(","),
        name: name,
        number: number.to_i,
        team: team,
        games: games.to_i,
        goals: goals.to_i,
        assists: assists,
        penalty_time: penalty_time,
        level: level,
        level_num: level_num,
        season: season,
        points: goals.to_i + assists.to_i,
        position: "skater"
      }
      p entry
      bulk += [ { index: { _index: "hockey", _type: "humans", _id: entry[:id] } }, entry ]
      $stdout.write("P")
      $stdout.flush
    end

    goalie_entries = division_stats.xpath("//table[contains(*//th/text(), 'Goalie Stats')]//tr[td]")
    goalie_entries.each do |goalie_doc|
      cells = goalie_doc.children

      #Name  Team  GP  Shots GA  GAA Save %
      name = cells[0].text
      team = cells[1].text
      games = cells[2].text
      shots = cells[3].text
      goals_against = cells[4].text
      goalie_stats[name] = entry = {
        id: [name, team, season].join(","),
        name: name,
        team: team,
        games: games.to_i,
        shots: shots.to_i,
        goals_against: goals_against.to_i,
        level: level,
        season: season,
        position: "goalie",
      }
      p entry
      bulk += [ { index: { _index: "hockey", _type: "humans", _id: entry[:id] } }, entry ]
      $stdout.write("G")
      $stdout.flush
    end
    next if bulk.empty?
    es.bulk(body: bulk)
    $stdout.puts
  end
end

seasons = (1..33)
seasons.each do |s| 
  process_season(s)
end
