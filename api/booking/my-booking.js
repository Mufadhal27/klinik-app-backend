const dbConnect = require("../../utils/dbConnect");
const Booking = require("../../models/Booking");
const protect = require('../../middleware/protect');

module.exports = async function handler(req, res) {
  // CORS Headers
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

  // Database Connection
  try {
    await dbConnect();
  } catch (err) {
    console.error("❌ Gagal koneksi database:", err.message);
    return res.status(500).json({ error: "❌ Gagal koneksi database." });
  }

  // Only GET method is allowed for this endpoint
  if (req.method !== "GET") {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `❌ Method ${req.method} tidak diizinkan.` });
  }

  try {
    // Apply protect middleware
    await protect(req, res, async () => {
      const userId = req.user.id;

      // Find bookings for the logged-in user
      const userBookings = await Booking.find({ userId: userId }).sort({ bookingDate: 1, bookingTime: 1 });

      return res.status(200).json(userBookings);
    });
  } catch (err) {
    console.error("❌ Error fetching user bookings:", err.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: "❌ Terjadi kesalahan server saat mengambil booking.", details: err.message });
    }
  }
};