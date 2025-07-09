const dbConnect = require("../utils/dbConnect");
const Booking = require("../models/Booking");

module.exports = async (req, res) => {
  await dbConnect();

  const { method, query, body } = req;

  try {
    if (method === "GET") {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      return res.status(200).json(bookings);
    }

    if (method === "POST") {
      const booking = new Booking(body);
      await booking.save();
      return res.status(201).json({ message: "Booking berhasil!", booking });
    }

    if (method === "PUT") {
      const updated = await Booking.findByIdAndUpdate(query.id, body, { new: true });
      return res.status(200).json(updated);
    }

    if (method === "DELETE") {
      await Booking.findByIdAndDelete(query.id);
      return res.status(200).json({ message: "Booking berhasil dihapus." });
    }

    return res.status(405).json({ message: "Method tidak diizinkan." });
  } catch (err) {
    console.error("❌ Booking Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
