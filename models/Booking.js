// backend/models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { // Tambahkan field userId
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', 
  },
  serviceName: { 
    type: String,
    required: true,
  },
  bookingDate: { 
    type: Date,
    required: true,
  },
  bookingTime: { 
    type: String, 
    required: true,
  },
  userName: { 
    type: String,
    required: true,
  },
  userEmail: { 
    type: String,
    required: true,
  },
  userPhone: { 
    type: String,
    required: true,
  },
  notes: { 
    type: String,
    default: "",
  },
}, {
  timestamps: true
});

// Tambahkan index untuk pencarian cepat berdasarkan tanggal dan waktu
bookingSchema.index({ bookingDate: 1, bookingTime: 1 });

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);