const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// Ambil semua booking
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Gagal ambil data booking" });
  }
});

// Tambah booking baru
router.post("/", async (req, res) => {
  try {
    const booking = new Booking(req.body); // ← cukup ini, jam akan otomatis ikut
    await booking.save();
    res.status(201).json({ message: "Booking berhasil!" });
  } catch (error) {
    console.error("❌ Gagal simpan booking:", error);
    res.status(500).json({ error: "Gagal simpan booking." });
  }
});


module.exports = router;
