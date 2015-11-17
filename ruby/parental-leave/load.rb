require "yaml"
require "json"
require "elasticsearch"
require "clamp"
require "open-uri"

class ParentalLeaveLoader < Clamp::Command
  option "--elasticsearch-url", "URL", "The URL of Elasticsearch.", :default => "http://localhost:9200/"
  option "--data-url", "URL", "The url of the parental-leave data", :default => "https://raw.githubusercontent.com/davedash/parental-leave/master/data.yaml"

  def execute
    es = Elasticsearch::Client.new(url: elasticsearch_url)

    template = File.read(File.join(File.dirname(__FILE__), "elasticsearch-template.json"))
    es.indices.put_template(:name => "parental-leave", :body => JSON.parse(template))

    data = YAML.load(open(data_url).read)

    bulk = []
    data.each do |entry|
      # Make all the keys lowercase
      company = Hash[entry.collect { |k,v| [ k.downcase, v ]}]

      # document id is the company name, lowercased.
      doc_id = company["company"].downcase

      bulk << { index: { _index: "parental-leave", _type: "leave", _id: doc_id } }
      bulk << company
    end

    puts "Writing #{data.size} documents..."
    es.bulk(body: bulk)
    puts "Done! :)"
  end

end

if $0 == __FILE__ 
  ParentalLeaveLoader.run(ARGV)
end
