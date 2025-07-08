const Booking = require("../models/Booking");

// GET semua booking
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST buat booking
exports.createBooking = async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT update booking
exports.updateBooking = async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE booking
exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking berhasil dihapus." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
