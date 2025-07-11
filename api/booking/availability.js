const dbConnect = require("../../utils/dbConnect");
const Booking = require("../../models/Booking");
const moment = require("moment");

module.exports = async function handler(req, res) {
  // CORS
  const allowedOrigins = ["https://klinik-app-frontend.vercel.app"];
  const origin = req.headers.origin;
  const isPreview = origin && origin.endsWith("-mufadhals-projects.vercel.app");
  if (allowedOrigins.includes(origin) || isPreview) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ error: `❌ Method ${req.method} tidak diizinkan.` });
  }

  try {
    await dbConnect();
  } catch (err) {
    console.error("❌ DB error:", err.message);
    return res.status(500).json({ error: "❌ Gagal koneksi database." });
  }

  try {
    const { date, serviceName } = req.query;

    // Validasi tanggal 
    if (!date)
      return res.status(400).json({ error: "❌ Parameter 'date' diperlukan." });

    const dateMoment = moment(date, "YYYY-MM-DD", true);
    if (!dateMoment.isValid())
      return res
        .status(400)
        .json({ error: "❌ Format tanggal tidak valid. Gunakan YYYY-MM-DD." });

    // Query build
    const query = { bookingDate: new Date(dateMoment.format("YYYY-MM-DD")) };
    if (serviceName) query.serviceName = serviceName; // filter per layanan jika ada

    const bookings = await Booking.find(query).select("bookingTime");

    const bookedTimes = bookings.map((b) => b.bookingTime);

    return res.status(200).json({
      date,
      serviceName: serviceName || "ALL",
      bookedTimes,
    });
  } catch (err) {
    console.error("❌ Fetch availability error:", err.message);
    return res.status(500).json({
      error: "❌ Terjadi kesalahan server saat mengambil ketersediaan.",
      details: err.message,
    });
  }
};
