window.Kibana = Kibana = Ember.Application.create()

class Kibana.SearchInputView extends Ember.TextField
  placeholder: "Search..."

  #init: () -> @_super()

  insertNewline: (event) -> 
    @set("update", new Date())
    @set("query", @get("value"))

class Kibana.ResultsTable extends Ember.View
  templateName: "results-table"

  columns: [ "@message" ]

  update:
    

class Kibana.ElasticSearch extends Ember.Object
  url: "http://demo.logstash.net:9200"

  search: (query) ->
    console.log("Search!")
    @set("results", [ {"@message": "foobar" } ])

es = new Kibana.ElasticSearch()

search = new Kibana.SearchInputView()
search.addObserver("update", () -> es.search(search.query))
search.appendTo("body")

results = new Kibana.ResultsTable()
results.appendTo("body")
es.addObserver("searchResults", results.update)
