(function() {
  var Foo, f, http;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  http = require("http");
  Foo = (function() {
    function Foo() {
      this.url = "http://localhost:9200";
    }
    Foo.prototype.field = function(query, field) {
      var client, request;
      client = http.createClient(9200, "localhost");
      request = client.request("GET", "/_search");
      request.write(JSON.stringify({
        "query": {
          "query_string": {
            "query": query
          }
        },
        "facets": {
          "field": {
            "terms": {
              "field": field
            }
          }
        }
      }));
      request.end();
      return request.on("response", __bind(function(response) {
        return this.field_response(response);
      }, this));
    };
    Foo.prototype.field_response = function(response) {
      console.log("STATUS: " + response.statusCode);
      console.log("HEADERS: " + JSON.stringify(response.headers));
      response.setEncoding("utf8");
      return response.on("data", __bind(function(chunk) {
        return console.log("BODY: " + chunk);
      }, this));
    };
    return Foo;
  })();
  f = new Foo();
  f.field("@type:syslog", "program");
}).call(this);
