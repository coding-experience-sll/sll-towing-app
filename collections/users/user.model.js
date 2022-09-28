const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  email: { type: String, unique: true, reqired: true },
  hash: { type: String, required: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: Number, required: true, unique: true },
  nationality: { type: String, required: true },
  language: { type: String, required: true },
  currency: { type: String, default: "ARS" },
  currencyAmount: { type: Number },
  doNotDisturb: { type: Boolean, default: false },
  overlappingApps: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  forgotPwToken: { type: String },
  vehicleList: { type: Array, default: [] },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now() },
  playerId: { type: String },
});

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.hash;
  },
});

module.exports = mongoose.model("User", schema);
