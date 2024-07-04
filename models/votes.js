const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Votes = new Schema({
  code: {
    type: String,
    required: true,
  },
  type: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("User", Votes);