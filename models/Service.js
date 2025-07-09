const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },
  harga: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
