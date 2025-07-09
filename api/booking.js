const dbConnect = require("../utils/dbConnect");
const Booking = require("../models/Booking");

module.exports = async function handler(req, res) {
  await dbconnect();

  if (req.method === "POST") {
    try {
      const { nama, layanan, tanggal, jam, catatan } = req.body;

      if (!nama || !layanan || !tanggal || !jam) {
        return res.status(400).json({ error: "Data tidak lengkap" });
      }

      const booking = await Booking.create({ nama, layanan, tanggal, jam, catatan });
      return res.status(201).json(booking);
    } catch (error) {
      console.error("❌ Error create booking:", error);
      return res.status(500).json({ error: "Gagal membuat booking" });
    }
  }

  return res.status(405).json({ error: "Method tidak diizinkan" });
};
