require "nokogiri"
require "open-uri"
require "elasticsearch"

es = Elasticsearch::Client.new

base_url = "http://stats.liahl.org"
stats_main = "#{base_url}/display-stats.php?league=1&season=32"

p stats_main
doc = Nokogiri::HTML(open(stats_main))
stats_links = doc.xpath("//a[contains(text(),'Player Stats')]")

levels = doc.xpath("//a[contains(text(), 'Player Stats')]/../../preceding-sibling::tr[1]").collect(&:text)

player_stats = {}
goalie_stats = {}
stats_links.each_with_index do |link|
  level = levels.shift
  p level
  href = link.attributes["href"].value

  url = base_url + "/" + href
  p url
  division_stats = Nokogiri::HTML(open(url))
  season = href[/season=\d+/].split("=").last
  level_num = href[/level=\d+/].split("=").last

  player_entries = division_stats.xpath("//table[contains(*//th/text(), 'Player Stats')]//tr[td]")
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
      id: [name, number, team].join(","),
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
      points: goals.to_i + assists.to_i
    }
    es.index(index: "hockey", type: "players", :body => entry)
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
      id: [name, team].join(","),
      name: name,
      team: team,
      games: games.to_i,
      shots: shots.to_i,
      goals_against: goals_against.to_i,
      level: level,
      season: season,
    }
    es.index(index: "hockey", type: "goalie", :body => entry)
  end

  sleep(0.500)
end
