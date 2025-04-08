const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    productName: { type: String, require: true },
    description: { type: String, require: true },
    image: { type: String, require: true },
    productnum: { type: Number, require: true },
    image:{type:String,require:true},
    customer: { type: Schema.Types.ObjectId, ref: "users", require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("products",productSchema)