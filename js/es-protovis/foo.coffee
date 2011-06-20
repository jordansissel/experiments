http = require("http")

class Foo
  constructor: () ->
    @url = "http://localhost:9200"
  # constructor

  field: (query, field) ->
    client = http.createClient(9200, "localhost")
    request = client.request("GET", "/_search")
    request.write(JSON.stringify({
      "query": { "query_string": { "query": query } },
      "facets": {
        "field": {
          "terms": {
            "field": field
          }
        }
      }
    }))
    request.end()
    request.on("response", (response) => @field_response(response))
  # field

  field_response: (response) ->
    console.log("STATUS: " + response.statusCode)
    console.log("HEADERS: " + JSON.stringify(response.headers))
    response.setEncoding("utf8")
    response.on("data", (chunk) =>
      console.log("BODY: " + chunk)
    )
  # end field_response
# end class Foo

f = new Foo()
f.field("@type:syslog", "program")
