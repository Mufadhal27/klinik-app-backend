const dbConnect = require("../utils/dbConnect");
const Booking = require("../models/Booking");

module.exports = async function handler(req, res) {
  await dbConnect();

  const method = req.method;

  if (method === "POST") {
    const { nama, layanan, tanggal, jam, catatan } = req.body;

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
  }

  if (method === "GET") {
    try {
      const all = await Booking.find();
      return res.status(200).json(all);
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data booking." });
    }
  }

  if (method === "DELETE") {
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
  }

  return res.status(405).json({ error: "Method tidak diizinkan." });
};
