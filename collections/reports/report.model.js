const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  vehicle: { type: mongoose.SchemaTypes.ObjectId, ref: "Vehicle" },
  reportStatus: {
    code: { type: Number, default: 0 },
    label: { type: String, default: "Pendiente" },
  },
  createdAt: { type: Date, default: Date.now() },
  type: { type: String, required: true },
  receiver: { type: String, required: true },
  sender: { type: String, required: true },
  approvals: { type: Array },
  description: { type: String },
  rejectReason: { type: String },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
});

module.exports = mongoose.model("Report", schema);
