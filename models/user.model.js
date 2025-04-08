const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String },
    password: { type: String },
    isadmin: { type: Boolean, default: false },
    isapprove: { type: Boolean, default: false },
  },
  {
    timeseries: true,
  }
);

module.exports = mongoose.model("users", userSchema);
