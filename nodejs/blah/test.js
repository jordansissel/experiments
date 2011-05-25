var mongoose = require("mongoose");

require("./models/Check.js");

var db = mongoose.createConnection("mongodb://localhost/fancy");
var Check = db.model("Check");

entry = new Check();
entry.name = "testing one two";
entry.text = "foo\nbar\n";
setTimeout(function() {
  console.log("Saving...");
  entry.save(function(err) {
    console.log("Done!")
  });
}, 5000);
