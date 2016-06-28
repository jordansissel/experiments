require "nokogiri"
require "elasticsearch"
require "peach"
require "clamp"

def logtime(message, &block)
  start = Time.now
  block.call
  duration = Time.now - start
  puts format("%.2fs: %s", duration, message)
end

class Player
  def initialize(number, position, name)
    @number, @position, @name = number, position, name
  end

  def to_hash
    {
      :number => @number,
      :position => @position,
      :name => @name
    }
  end
end

class Point
  def initialize(goal, assist, time, period)
    @goal, @assist, @time, @period = goal, assist, time, period
  end

  def to_hash
    {
      goal: @goal,
      assist: @assist,
      time: @time,
      period: @period
    }
  end
end

class Stats < Clamp::Command
  module XPath
    SHOTS_ON_GOAL = "//th[contains(text(), 'Shots on Goal')]/ancestor::table[1]/tr/th"
    PLAYERS = "//th[contains(text(), 'Players in')]/ancestor::table[1]"
    REFEREES = "//th[contains(text(), 'Referee')]/following-sibling::td"
    SCOREKEEP = "//th[contains(text(), 'Scorekeeper')]/following-sibling::td"
    EVENTS = "/html/body/table[last()]/tr[last()]"
  end

  option "--elasticsearch-url", "URL", "Elasticsearch url", required: true
  option "--elasticsearch-index", "INDEX", "Elasticsearch index", default: "hockey-scrape"

  def fetch(url)
    es = Elasticsearch::Client.new(host: elasticsearch_url)
    id = Digest::SHA256.hexdigest(url)
    p url => id
    result = es.get(index:elasticsearch_index, id: id)
    result["_source"]["content"]
  end

  def process_season(season)
    es = Elasticsearch::Client.new(host: elasticsearch_url)
    base_url = "http://stats.liahl.org"
    puts "Fetching season #{season}"
    stats_main = "#{base_url}/display-stats.php?league=1&season=#{season}"
    puts stats_main

    doc = Nokogiri::HTML(fetch(stats_main))

    #process_stats(es, base_url, doc)
    process_games(es, base_url, doc)
  end

  def process_games(es, base_url, doc)
    team_links = doc.xpath("//a[contains(@href,'display-schedule.php')]")

    team_links.each do |team_link|
      url = base_url + "/" + team_link.attributes["href"]
      schedule = Nokogiri::HTML(fetch(url))

      schedule.xpath("//a[contains(@href,'oss-scoresheet')]").each do |game_link|
        game_href = game_link.attributes["href"].value
        game_url = base_url + "/" + game_href
        game = Nokogiri::HTML(fetch(game_url))

        level = game.xpath("//td[contains(text(),'Level:')]").first.text.sub(/^Level:\s*/, "")

        visitor_players, home_players = game.xpath(XPath::PLAYERS).collect { |table| parse_players(table) }

        visitor = {
          players: visitor_players,
          shots: game.xpath(XPath::SHOTS_ON_GOAL)[1].text.sub(/Visitor:/, "").to_i,
        }

        home = {
          players: home_players,
          shots: game.xpath(XPath::SHOTS_ON_GOAL)[2].text.sub(/Home:/, "").to_i,
        }

        refs = game.xpath(XPath::REFEREES).collect(&:text)
        scorekeep = game.xpath(XPath::SCOREKEEP).first.text

        visitor_scoring, home_scoring = game.xpath("//th[text() = 'Scoring']").collect { |table| parse_scoring(table) }
        visitor_penalties, home_penalties = game.xpath("//th[text() = 'Penalties']").collect { |table| parse_penalties(table) }

        require "pry"
        binding.pry
      end
    end
  end

  def parse_players(doc)
    doc.xpath("./tr/td/table/tr/td").each_slice(3).collect do |number, position, name|
      Player.new(number.text.to_i, position.text.strip, name.text.strip)
    end
  end

  def parse_scoring(doc)
    doc.xpath("../../tr/td").each_slice(6).collect do |period, time, condition, goal, *assist|
      p [period.text.to_i, time.text, condition.text, goal.text.to_i, assist.collect(&:text).collect(&:to_i)]
    end
  end

  def parse_penalties(doc)
    doc.xpath("../../tr/td").each_slice(6).collect do |period, number, infraction, minutes, off_ice, pstart, pend, on_ice|
      p [period.text.to_i, number.text.to_i, infraction.text, minutes.text.to_i, off_ice, pstart.text, pend.text, on_ice]
    end
  end

  def process_stats(es, base_url, doc)
    stats_links = doc.xpath("//a[contains(text(),'Player Stats')]")

    levels = doc.xpath("//a[contains(text(), 'Player Stats')]/../../preceding-sibling::tr[1]").collect(&:text)

    player_stats = {}
    goalie_stats = {}
    stats_links.peach(2) do |link|
      level = levels.shift
      href = link.attributes["href"].value

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
        id = [name, number, team, season].join(",")
        puts(format("[%d]%s - %s", number, name, team)) if team =~ /destroyer/i
        player_stats[id] = entry = {
          id: id,
          name: name,
          number: number.to_i,
          team: team,
          games: games.to_i,
          goals: goals.to_i,
          assists: assists.to_i,
          penalty_time: penalty_time.to_i,
          level: level,
          level_num: level_num.to_i,
          season: season.to_i,
          points: goals.to_i + assists.to_i,
          position: "skater"
        }
        bulk += [ { index: { _index: "hockey", _type: "humans", _id: entry[:id] } }, entry ]
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
        bulk += [ { index: { _index: "hockey", _type: "humans", _id: entry[:id] } }, entry ]
      end
      next if bulk.empty?

      logtime("Season #{season} / Level #{level}") do
        es.bulk(body: bulk)
      end
    end
  end

  def execute
    #seasons = (30..35)
    seasons = (35..35)
    seasons.each do |s| 
      process_season(s)
    end
  end
end

Stats.run(ARGV)
