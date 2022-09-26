const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  type: { type: String, required: true },
  model: { type: String, required: true },
  plateNumber: { type: String, required: true, unique: true },
  year: { type: Number, required: true },
  color: { type: String, required: true },
  user: { type: String, required: true },
  payments: { type: Boolean, default: false },
  vehiclePicture: { type: String },
  createdAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Vehicle", schema);
