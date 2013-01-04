window.Kibana = Kibana = Ember.Application.create()

class Kibana.SearchInputView extends Ember.View
  templateName: "search-input"
  insertNewline: (event) -> alert("insert")

console.log("OK")


