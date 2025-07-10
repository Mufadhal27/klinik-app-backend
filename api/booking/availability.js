const dbConnect = require("../../utils/dbConnect");
const Booking = require("../../models/Booking");
const moment = require('moment');

module.exports = async function handler(req, res) {
  const allowedOrigins = [
    "https://klinik-app-frontend.vercel.app",
  ];
  const origin = req.headers.origin;
  const isVercelPreviewOrigin = origin && origin.endsWith("-mufadhals-projects.vercel.app");

  if (allowedOrigins.includes(origin) || isVercelPreviewOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
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

  if (req.method !== "GET") {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `❌ Method ${req.method} tidak diizinkan.` });
  }

  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "❌ Parameter 'date' diperlukan." });
    }

    const queryDateMoment = moment(date, 'YYYY-MM-DD', true);
    if (!queryDateMoment.isValid()) {
      return res.status(400).json({ error: "❌ Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
    }

    const bookingsOnDate = await Booking.find({
      bookingDate: new Date(queryDateMoment.format('YYYY-MM-DD'))
    }).select('bookingTime');

    const bookedTimes = bookingsOnDate.map(booking => booking.bookingTime);

    return res.status(200).json({ date: date, bookedTimes: bookedTimes });

  } catch (err) {
    console.error("❌ Error fetching availability:", err.message);
    return res.status(500).json({ error: "❌ Terjadi kesalahan server saat mengambil ketersediaan.", details: err.message });
  }
};