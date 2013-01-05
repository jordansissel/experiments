results = [ 
  { "message": "hello world", "timestamp": "12345" },
  { "message": "goodbye", "timestamp": "12346" },
  { "message": "<foo>", "timestamp": "12346" },
]
columns = [ "timestamp", "message" ]

class SearchInputView
  constructor: () ->
    @element = d3.select(document.createElement("input"))
    @element.attr("type", "text")

class ResultsTable
  constructor: () ->
    @element = document.createElement("table")
    @header = d3.select(@element).append("thead").append("tr")
    @body = d3.select(@element).append("tbody")
    @columns = []

  update: (data) ->
    # Keep last data for refreshes
    @data = data

    # Show all object properties if no columns are selected
    columns = @columns
    if columns.length == 0
      columns = (key for key, value of data[0])
    
    # Write the new columns
    @header.selectAll("th").remove()
    th = @header.selectAll("th").data(columns)
    th.text(String) # for in-place updates
    th.enter().append("th").text(String) # for new data
    th.exit().remove() # for removed data

    # Manage the rows, one for each result
    rows = @body.selectAll("tr").data(data)
    rows.enter().append("tr")
    rows.exit().remove()

    # manage all the cells in a row
    cells = rows.selectAll("td")
      .data((row) -> columns.map((c) -> row[c]))
      .text(String) # update any existing cells
    cells.enter() # append any new cells
        .append("td")
        .text(String)
        .on("mouseover", () -> d3.select(this).style("background-color", "green"))
        .on("mouseout", () -> d3.select(this).style("background-color", "inherit"))
    cells.exit().remove() # remove any deleted cells

  refresh: () -> 
    if @data
      @update(@data)

class ElasticSearch
  constructor: (@url) ->
  search: (query, callback) ->
    dsl = { "query": { "query_string": { "query": query } } }
    jQuery.getJSON(@url + "/_search?callback=?", dsl, (data) => callback(data))
  
#s = new SearchInputView()
#d3.select("body").append(s.element)
v = new ResultsTable()
document.body.appendChild(v.element)

es = new ElasticSearch("http://demo.logstash.net:9200")
es.search("hello world", (data) => 
  v.update(hit._source for hit in data.hits.hits))

#blah = (columns) =>
#  () =>
#    v.columns = columns
#    v.refresh()
#
#setTimeout(blah(["@message"]), 2000)
#setTimeout(blah(["@message", "@timestamp"]), 4000)
#setTimeout(blah(["@timestamp", "@source_host", "@message"]), 6000)
