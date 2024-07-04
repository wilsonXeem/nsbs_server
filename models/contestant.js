const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contestant = new Schema({
  fullName: { type: String, required: true },
  votes: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Contestant", contestant);
