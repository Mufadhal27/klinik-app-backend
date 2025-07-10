const dbConnect = require("../utils/dbConnect");
const Booking = require("../models/Booking");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://klinik-app-frontend.vercel.app"); 
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); 
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); 

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await dbConnect();
  } catch (err) {
    return res.status(500).json({ error: "❌ Gagal koneksi database." });
  }

  const { method, query, body } = req;

  try {
    switch (method) {
      case "GET":
        const allBookings = await Booking.find();
        return res.status(200).json(allBookings);

      case "POST":
        const { nama, layanan, tanggal, jam, catatan } = body || {};
        if (!nama || !layanan || !tanggal || !jam) {
          return res.status(400).json({ error: "❌ Semua field wajib diisi." });
        }
        const created = await new Booking({ nama, layanan, tanggal, jam, catatan }).save();
        return res.status(201).json({ message: "✅ Booking berhasil dibuat." });

      case "DELETE":
        if (!query.id) {
          return res.status(400).json({ error: "❌ ID booking harus disediakan." });
        }
        await Booking.findByIdAndDelete(query.id);
        return res.status(200).json({ message: "✅ Booking berhasil dihapus." });

      default:
        return res.status(405).json({ error: "❌ Method tidak diizinkan." });
    }
  } catch (err) {
    console.error("❌ Error Booking:", err.message);
    return res.status(500).json({ error: "❌ Terjadi kesalahan saat memproses permintaan." });
  }
};
