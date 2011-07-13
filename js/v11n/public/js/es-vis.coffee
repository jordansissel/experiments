$ = jQuery

class ESVis
  constructor: () ->
    console.log("esvis")
    $().ready(() => @setup())
  # end constructor

  setup: () ->
    console.log("settingup")
    $("#query").submit((e) => @query(e))
  # end setup

  query: (event) ->
    event.preventDefault()
    element = event.target
    query = $(element).find("#text").val()
    request = {
      "size": 0,
      "query" : {
        "query_string": {
          "query": query #"@type:apache AND -@tags:_grokparsefailure"
        }
      },
      "facets" : {
        "my_facet" : {
          "terms" : {
            #"script_field" : "_source[\"@fields\"].request",
            "field" : "response",
            "size" : 20
          }
        }
      }
    }
    console.log(["Request", request])
    $.getJSON("http://localhost:9200/_search",
              { "source": JSON.stringify(request) },
              (data, status, xhr) => @results(data, status))
  # end query

  results: (data, status) ->
    terms = jsonPath(data, "$.facets.my_facet.terms[*]")
    console.log(["response", terms])
  # end results
# end class ESVis

esvis = new ESVis()
