const mongoose = require("mongoose");
const salesSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    temperature: {
      type: Number,
      default: 0,
    },
    rainfall: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "sales",
  }
);
module.exports = mongoose.model("Sales", salesSchema);