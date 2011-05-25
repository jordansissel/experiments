/**
 * Module dependencies.
 */

var express = require("express");
var mongoose = require("mongoose");
var util = require("util");

var app = module.exports = express.createServer();
var db = mongoose.connect("mongodb://localhost/test");

require("./models/Check.js");

var db = mongoose.createConnection("mongodb://localhost/fancy");
var Check = db.model("Check");

// Configuration

app.configure(function() {
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + "/public"));
});

app.configure("development", function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure("production", function() {
  app.use(express.errorHandler()); 
});

// Routes

app.get("/", function(request, response) {
  response.render("index", {
    title: "Express"
  });
});

app.post("/api/v1/notify", function(request, response) { 
  var callback = function(err) {
    if (err === null) {
      response.send("OK\n");
    } else {
      response.send("error: " + err, 500);
    }
  };

  try {
    entry = new Check();
    entry.name = request.param.name;
    entry.text = request.param.text;
    entry.save(callback);
  } catch (err) {
    callback(err);
  }
});

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
