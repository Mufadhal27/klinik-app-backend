const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },
  layanan: {
    type: String,
    required: true,
  },
  tanggal: {
    type: String,
    required: true,
  },
  jam: {
    type: String, // ← TAMBAHKAN INI
    required: true,
  },
  catatan: {
    type: String,
    default: "",
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);
