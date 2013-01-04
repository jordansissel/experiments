window.Kibana = Kibana = Ember.Application.create()

class Kibana.SearchInputView extends Ember.TextField
#Kibana.SearchInputView = Ember.TextField.extend({
  insertNewline: (event) -> alert("insert")
#})

console.log("OK")
