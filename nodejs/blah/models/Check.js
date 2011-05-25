var mongoose = require("mongoose")

var Check = new mongoose.Schema({
  name: { type: String },
  healthy: { type: Number },
  source: { type: String },
  text: { type: String },
  timestamp: { type: Date, default: Date.now }
});


mongoose.model("Check", Check);
