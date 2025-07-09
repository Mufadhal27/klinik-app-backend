const dbConnect = require("../utils/dbConnect");
const Booking = require("../models/Booking");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await dbConnect();
  } catch (error) {
    return res.status(500).json({ error: "Gagal koneksi database." });
  }

  const method = req.method;

  switch (method) {
    case "POST":
      const { nama, layanan, tanggal, jam, catatan } = req.body || {};

      if (!nama || !layanan || !tanggal || !jam) {
        return res.status(400).json({ error: "Semua field wajib diisi." });
      }

      try {
        const newBooking = new Booking({ nama, layanan, tanggal, jam, catatan });
        await newBooking.save();
        return res.status(201).json({ message: "Booking berhasil dibuat." });
      } catch (error) {
        return res.status(500).json({ error: "Gagal menyimpan booking." });
      }

    case "GET":
      try {
        const all = await Booking.find();
        return res.status(200).json(all);
      } catch (error) {
        return res.status(500).json({ error: "Gagal mengambil data booking." });
      }

    case "DELETE":
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "ID booking harus disediakan." });
      }

      try {
        await Booking.findByIdAndDelete(id);
        return res.status(200).json({ message: "Booking berhasil dihapus." });
      } catch (error) {
        return res.status(500).json({ error: "Gagal menghapus booking." });
      }

    default:
      return res.status(405).json({ error: "Method tidak diizinkan." });
  }
};
