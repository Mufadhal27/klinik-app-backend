const dbConnect = require('../utils/dbConnect');
const Booking = require('../models/Booking');

module.exports = async function handler(req, res) {
  await dbConnect();
  const { method, body, query } = req;

  if (method === "GET") {
    try {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      return res.status(200).json(bookings);
    } catch (err) {
      return res.status(500).json({ message: "Gagal ambil data booking" });
    }
  }

  if (method === "POST") {
    try {
      const booking = new Booking(body);
      await booking.save();
      return res.status(201).json({ message: "Booking berhasil!", booking });
    } catch (err) {
      return res.status(500).json({ error: "Gagal simpan booking." });
    }
  }

  if (method === "PUT") {
    try {
      const updated = await Booking.findByIdAndUpdate(query.id, body, { new: true });
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if (method === "DELETE") {
    try {
      await Booking.findByIdAndDelete(query.id);
      return res.status(200).json({ message: "Booking berhasil dihapus." });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ message: "Method tidak diizinkan." });
};
