const dbConnect = require("../utils/dbConnect");
const Booking = require("../models/Booking");

module.exports = async function handler(req, res) {
  const allowedOrigins = [
    "https://klinik-app-frontend.vercel.app",
  ];
  const origin = req.headers.origin;
  const isVercelPreviewOrigin = origin && origin.endsWith("-mufadhals-projects.vercel.app");

  if (allowedOrigins.includes(origin) || isVercelPreviewOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await dbConnect();
  } catch (err) {
    console.error("❌ Gagal koneksi database:", err.message);
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

      case "PUT": // Menambahkan case PUT yang ada di file aslinya
        if (!query.id) {
          return res.status(400).json({ error: "❌ ID booking diperlukan." });
        }
        const updated = await Booking.findByIdAndUpdate(query.id, body, { new: true });
        if (!updated) {
          return res.status(404).json({ error: "❌ Booking tidak ditemukan." });
        }
        return res.status(200).json(updated);

      case "DELETE":
        if (!query.id) {
          return res.status(400).json({ error: "❌ ID booking harus disediakan." });
        }
        const deleted = await Booking.findByIdAndDelete(query.id);
        if (!deleted) {
          return res.status(404).json({ error: "❌ Booking tidak ditemukan." });
        }
        return res.status(200).json({ message: "✅ Booking berhasil dihapus." });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `❌ Method ${method} tidak diizinkan.` });
    }
  } catch (err) {
    console.error("❌ Error Booking:", err.message);
    return res.status(500).json({ error: "❌ Terjadi kesalahan saat memproses permintaan." });
  }
};