require "nokogiri"
require "elasticsearch"
require "peach"
require "clamp"
require "cabin"

WORKERS = 1

def logtime(logger, message, &block)
  start = Time.now
  block.call
  duration = Time.now - start
  logger.info(message, :duration => duration)
end

class String
  def strip
    self.gsub(/^[[:space:]]+|[[:space:]]+$/, "")
  end
end

class GameReference
  attr_reader :url, :type
  def initialize(url, type)
    @url = url
    @type = type
  end
end

class Player
  attr_reader :number, :position, :name

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

  def to_s
    if @position
      format("%s (#%d %s)", name, number, position)
    else
      format("%s (#%d)", name, number)
    end
  end

end

class PenaltyEvent
  attr_reader :player, :infraction, :minutes
  attr_reader :penalty_start, :penalty_end
  # Does off_ice and on_ice matter?
  
  def time
    penalty_start
  end

  def initialize(player, infraction, minutes, off_ice, penalty_start, penalty_end, on_ice)
    @player = player
    @infraction = infraction
    @minutes = minutes

    @off_ice = off_ice
    @penalty_start = penalty_start
    @penalty_end = penalty_end
    @on_ice = on_ice
  end

  def to_s
    format("%s: %s to %s", penalty_start, infraction, player)
  end

  def to_hash
    {
      player: player && player.to_hash,
      infraction: infraction,
      minutes: minutes,
      duration: penalty_end.to_f - penalty_start.to_f,
      time: penalty_start.to_hash
    }
  end
end

class ScoringEvent
  attr_reader :time, :condition, :player, :assists

  def initialize(time, condition, player, assists)
    @time = time
    @condition = condition
    @player = player
    @assists = assists
  end

  def to_s
    assists = @assists ? @assists.count : 0
    case assists
    when 0
      format("%s: %s", @time, @player)
    when 1
      format("%s: %s from %s", @time, @player, @assists[0])
    when 2
      format("%s: %s from %s and %s", @time, @player, *@assists)
    end
  end

  def to_hash
    { 
      time: time.to_hash,
      condition: condition,
      player: @player && @player.to_hash,
      assists: @assists.collect(&:to_hash)
    }
  end
end

class GameTime
  PERIOD_DURATION_SECONDS = 20 * 60

  attr_reader :time, :period

  def initialize(period, clock)
    @period = period

    # Strip the 'whistle' note
    clock = clock.gsub(/[[:space:]]W$/, "")

    # Clock is 'time remaining' in the period. `mm:ss.S`
    period_time = case clock
    when /^\d+:\d+\.\d+$/
      minutes, seconds, subsec = clock.split(/[:.]/).map(&:to_i)
      (minutes * 60) + seconds + "0.#{subsec}".to_f
    when /^\d+\.\d+$/
      seconds, subsec = clock.split(/[.]/).map(&:to_i)
      seconds + "0.#{subsec}".to_f
    else
      raise "Unknown time format: #{clock.inspect}"
    end

    @time = period_time
  end

  def to_f
    matchtime
  end

  def matchtime
    (@period - 1) * PERIOD_DURATION_SECONDS + (PERIOD_DURATION_SECONDS - @time)
  end

  def to_hash
    {
      game: to_f,
      period: period,
      period_remaining: time,
    }
  end

  def to_s
    minutes = (@time / 60).to_i
    time_text = format("%02d:%.2f", minutes, @time - (minutes * 60))
    format("%s remaining in period %d", time_text, @period)
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
  BASE_URL = "http://stats.liahl.org"

  module XPath
    SHOTS_ON_GOAL = "//th[contains(text(), 'Shots on Goal')]/ancestor::table[1]/tr/th"
    PLAYERS = "//th[contains(text(), 'Players in')]/ancestor::table[1]"
    REFEREES = "//th[contains(text(), 'Referee')]/following-sibling::td"
    SCOREKEEP = "//th[contains(text(), 'Scorekeeper')]/following-sibling::td"
    EVENTS = "/html/body/table[last()]/tr[last()]"
  end

  option "--elasticsearch-url", "URL", "Elasticsearch url", required: true
  option "--elasticsearch-index", "INDEX", "Elasticsearch index", default: "hockey-scrape"

  def es
    @es ||= Elasticsearch::Client.new(host: elasticsearch_url)
  end

  def fetch(*urls)
    ids = urls.collect { |url| Digest::SHA256.hexdigest(url) }
    logger.info("Fetching documents", count: urls.count)
    result = es.mget(index: elasticsearch_index, body: { ids: ids })

    if urls.count == 1
      result["docs"].first["_source"]["content"]
    else
      result["docs"].collect { |doc| doc["_source"]["content"] }
    end
  rescue => e
    logger.error("Failure fetching docs", error: e, stack: e.backtrace)
    require "pry"
    binding.pry
    sleep 1
    retry
  end

  def find_games_in_season(season)
    es = Elasticsearch::Client.new(host: elasticsearch_url)
    logger.info("Fetching season", season: season)
    stats_main = "#{BASE_URL}/display-stats.php?league=1&season=#{season}"

    doc = Nokogiri::HTML(fetch(stats_main))
    team_links = doc.xpath("//a[contains(@href,'display-schedule.php')]").collect { |anchor| BASE_URL + "/" + anchor.attributes["href"] }

    if team_links.empty?
      logger.warn("No data found for season", season: season)
      return
    end
    fetch(*team_links).collect do |content|
      schedule = Nokogiri::HTML(content)
      rows = schedule.xpath("//tr[td/a[contains(@href, 'oss-scoresheet')]]")

      rows.collect do |row|
        path = row.xpath("./td/a").first.attributes["href"]
        game_type = row.xpath("./td[11]").text.downcase.gsub(/[0-9 ]/, "").strip

        GameReference.new(BASE_URL + "/" + path, game_type)
      end
    end.flatten.uniq
  end

  def process_game(es, game, game_id, type, season)
    level = game.xpath("//td[contains(text(),'Level:')]").first.text.sub(/^Level:\s*/, "")
    date = game.xpath("//td[contains(text(),'Date:')]").first.text.sub(/^Date:\s*/, "")
    location = game.xpath("//td[contains(text(),'Location:')]").first.text.sub(/^Location:\s*/, "")
    time_of_day = game.xpath("//td[contains(text(),'Time:')]").first.text.sub(/^Time:\s*/, "")

    game_start_time = DateTime.strptime("#{date} #{time_of_day}", "%m-%d-%y %I:%M %p").to_time

    visitor_name, home_name = game.xpath(XPath::PLAYERS).collect { |d| d.xpath("./tr/th").text.gsub(/[[:space:]]+Players in.*/, "") }

    visitor_players, home_players = game.xpath(XPath::PLAYERS).collect { |table| parse_players(table) }

    visitor = {
      name: visitor_name,
      players: visitor_players,
      shots: game.xpath(XPath::SHOTS_ON_GOAL)[1].text.sub(/Visitor:/, "").to_i,
    }

    home = {
      name: home_name,
      players: home_players,
      shots: game.xpath(XPath::SHOTS_ON_GOAL)[2].text.sub(/Home:/, "").to_i,
    }

    refs = game.xpath(XPath::REFEREES).collect(&:text)
    scorekeep = game.xpath(XPath::SCOREKEEP).first.text

    scoring = game.xpath("//th[text() = 'Scoring']")
    visitor[:scoring] = parse_scoring(scoring[0], visitor[:players])
    home[:scoring] = parse_scoring(scoring[1], home[:players])

    penalties = game.xpath("//th[text() = 'Penalties']")
    visitor[:penalties] = parse_penalties(penalties[0], visitor[:players])
    home[:penalties] = parse_penalties(penalties[1], home[:players])

    events = []

    base_event = {
      level: level,
      scorekeep: scorekeep,
      referees: refs,
      location: location,
      game: game_id,
      game_type: type,
      season: season
    }


    count = 0
    [home, visitor].each do |team|
      team_event = base_event.merge(team: team[:name])
      (team[:penalties] + team[:scoring]).each do |event|
        real_time = (game_start_time + event.time.to_f).iso8601(3)
        event_hash = event.to_hash.merge(team_event)
        event_hash[:time][:real] = real_time
        event_hash[:event] = event.class.name.sub(/Event$/, "").downcase

        if event.nil?
          p :GOTNILEVENT
          next
        end

        begin
          events << event_hash

          if event.is_a?(ScoringEvent)
            # Record assists as separate events
            event.assists.each_with_index do |player, i|
              assist_event = event_hash.merge(
                event: "assist",
                player: player.to_hash,
                scorer: event.player && event.player.to_hash,
                order: (i == 0 ? "primary" : "secondary")
              ).tap { |h| h.delete(:assists) }
              events << assist_event
            end
          end
        rescue => e
          require "pry"
          binding.pry
        end
      end
    end


    events = events.sort_by { |e| e[:time][:game] }

    # Make each event unique within a game, and make that identifier the same
    # regardless of how we process things (do it based on order)
    events.each_with_index do |event, i|
      event[:order] = i
    end

    #if game_id == 149074
      #require "pry"
      #binding.pry
    #end

    logger.info("Game processed", home: home[:name], visitor: visitor[:name], start_time: game_start_time, location: location, events: events.count)

    events
  end # def process_game

  def parse_players(doc)
    doc.xpath("./tr/td/table/tr/td[not(@colspan=3)]").each_slice(3).collect do |number, position, name|
      position = position.text.strip
      Player.new(number.text.to_i, position.empty? ? nil : position, name.text.strip.gsub(/[[:space:]]+/, " "))
    end
  rescue => e
    require "pry"
    binding.pry
  end

  def parse_scoring(doc, players)
    doc.xpath("../../tr/td").each_slice(6).collect do |period, time, condition, player, *assist|
      player = players.find { |p| p.number == player.text.to_i }
      assist = assist.collect { |a| players.find { |p| p.number == a.text.to_i } }.reject(&:nil?)

      ScoringEvent.new(GameTime.new(period.text.to_i, time.text.strip), condition.text.strip, player, assist)
    end
  end

  def parse_penalties(doc, players)
    doc.xpath("../../tr/td").each_slice(8).collect do |period, number, infraction, minutes, off_ice, pstart, pend, on_ice|
      period = period.text.to_i
      number = number.text.to_i if number
      player = players.find { |p| number == p.number }
      infraction = infraction.text if infraction
      minutes = minutes.text.to_i if minutes
      off_ice = GameTime.new(period, off_ice.text.strip) if off_ice
      pstart = GameTime.new(period, pstart.text.strip) if pstart

      if pend
        if !pend.text.strip.empty?
          pend = GameTime.new(period, pend.text.strip)
        else
          pend = nil
        end
      end

      if on_ice
        if on_ice.text.strip.empty?
          on_ice = nil
        else
          on_ice = GameTime.new(period, on_ice.text.strip) rescue nil
        end
      end

      PenaltyEvent.new(player, infraction, minutes, off_ice, pstart, pend, on_ice)
    end
  rescue => e
    require "pry"
    binding.pry
  end

  def execute
    logger.subscribe(STDOUT)
    logger.level = :info

    seasons = (35..35)
    seasons.to_a.reverse.each do |s| 
      matches = find_games_in_season(s)
      next if matches.nil?
      game_urls = matches.collect(&:url)
      game_types = matches.collect(&:type)

      games = fetch(*game_urls)
      events = games.zip(matches).pmap(WORKERS) do |html, match|
        game = Nokogiri::HTML(html)
        game_id = CGI.parse(URI.parse(match.url).query)["game_id"].first.to_i
        process_game(es, game, game_id, match.type, s)
      end.flatten.reject(&:empty?)

      bulk = events.each_with_index.collect do |event, i|
        doc_id = format("%s-%d", event[:game], event[:order])
        [ { index: { _index: "hockey-events", _type: "events", _id: doc_id } }, event ]
      end

      unique_games = events.collect { |event| event[:game] }.uniq.count

      count = 0
      bulk.each_slice(1000) do |slice|
        count += slice.count
        logtime(logger, "Uploading #{slice.count} slice of #{events.count} events from #{unique_games} games in season #{s}") do
          resp = es.bulk(body: slice.flatten)
          if resp["errors"]
            logger.error("Errors occurred uploading bulk.")
            require "pry"
            binding.pry
          end
        end
      end
      logger.info("Uploaded events", count: count)
    end
  end

  def logger
    @logger = Cabin::Channel.get($0)
  end
end

Stats.run(ARGV)
