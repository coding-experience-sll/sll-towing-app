const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  user: { type: String, required: true },
  playerId: { type: String, required: true },
  expirationDate: { type: Date },
  createdAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("PlayerId", schema);
