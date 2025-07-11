const dbConnect = require("../../utils/dbConnect");
const Booking = require("../../models/Booking");
const protect = require('../../middleware/protect');
const moment = require('moment');

module.exports = async function handler(req, res) {
  // ─────── CORS ───────
  const allowedOrigins = [
    "https://klinik-app-frontend.vercel.app",
  ];
  const origin = req.headers.origin;
  const isPreview = origin && origin.endsWith("-mufadhals-projects.vercel.app");
  if (allowedOrigins.includes(origin) || isPreview) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  // ────────────────────

  try {
    await dbConnect();
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
    return res.status(500).json({ error: "❌ Gagal koneksi database." });
  }

  const { method, query, body } = req;

  try {
    switch (method) {
      case "GET":
        const allBookings = await Booking.find({});
        return res.status(200).json(allBookings);

      case "POST":
        await protect(req, res, async () => {
          const {
            serviceName, bookingDate, bookingTime,
            userName, userEmail, userPhone, notes
          } = body || {};
          const userId = req.user.id;

          if (!serviceName || !bookingDate || !bookingTime || !userName || !userEmail || !userPhone) {
            return res.status(400).json({ error: "❌ Semua field wajib diisi." });
          }

          const bookingMoment = moment(`${bookingDate} ${bookingTime}`, 'YYYY-MM-DD HH:mm', true);
          if (!bookingMoment.isValid()) {
            return res.status(400).json({ error: "❌ Format tanggal atau jam tidak valid." });
          }

          const hour = bookingMoment.hour();
          if (hour < 8 || hour >= 20) {
            return res.status(400).json({ error: "❌ Booking hanya dapat dilakukan antara pukul 08:00 - 20:00." });
          }

          // Cek bentrok (+/- 15 menit) untuk layanan yang sama
          const before = bookingMoment.clone().subtract(15, 'minutes');
          const after = bookingMoment.clone().add(15, 'minutes');

          const conflict = await Booking.findOne({
            serviceName,
            bookingDate: new Date(bookingMoment.format("YYYY-MM-DD")),
            bookingTime: { $gte: before.format("HH:mm"), $lte: after.format("HH:mm") },
          });

          if (conflict) {
            return res.status(409).json({ message: "❌ Slot waktu ini sudah terisi. Silakan pilih waktu lain." });
          }

          const created = await Booking.create({
            userId, serviceName, bookingDate: new Date(bookingDate),
            bookingTime, userName, userEmail, userPhone, notes
          });

          return res.status(201).json({ message: "✅ Booking berhasil dibuat.", booking: created });
        });
        break;

      case "PUT":
        await protect(req, res, async () => {
          const id = query.id;
          const userId = req.user.id;

          const {
            serviceName, bookingDate, bookingTime,
            userName, userEmail, userPhone, notes
          } = body || {};

          if (!id) {
            return res.status(400).json({ error: "❌ ID booking diperlukan." });
          }

          const bookingMoment = moment(`${bookingDate} ${bookingTime}`, 'YYYY-MM-DD HH:mm', true);
          if (!bookingMoment.isValid()) {
            return res.status(400).json({ error: "❌ Format tanggal/jam tidak valid." });
          }

          const hour = bookingMoment.hour();
          if (hour < 8 || hour >= 20) {
            return res.status(400).json({ error: "❌ Booking hanya boleh antara 08:00 - 20:00." });
          }

          // Cek bentrok (+/-15 menit) dengan booking lain (selain dirinya)
          const before = bookingMoment.clone().subtract(15, 'minutes');
          const after = bookingMoment.clone().add(15, 'minutes');

          const conflict = await Booking.findOne({
            _id: { $ne: id },
            serviceName,
            bookingDate: new Date(bookingMoment.format("YYYY-MM-DD")),
            bookingTime: { $gte: before.format("HH:mm"), $lte: after.format("HH:mm") },
          });

          if (conflict) {
            return res.status(409).json({ message: "❌ Slot waktu ini sudah dibooking orang lain." });
          }

          const updated = await Booking.findOneAndUpdate(
            { _id: id, userId },
            {
              serviceName,
              bookingDate: new Date(bookingDate),
              bookingTime,
              userName,
              userEmail,
              userPhone,
              notes
            },
            { new: true }
          );

          if (!updated) {
            return res.status(404).json({ error: "❌ Booking tidak ditemukan atau bukan milik Anda." });
          }

          return res.status(200).json({ message: "✅ Booking berhasil diperbarui.", booking: updated });
        });
        break;

      case "DELETE":
        await protect(req, res, async () => {
          const id = query.id;
          const userId = req.user.id;

          if (!id) {
            return res.status(400).json({ error: "❌ ID booking diperlukan." });
          }

          const deleted = await Booking.findOneAndDelete({ _id: id, userId });
          if (!deleted) {
            return res.status(404).json({ error: "❌ Booking tidak ditemukan atau bukan milik Anda." });
          }

          return res.status(200).json({ message: "✅ Booking berhasil dihapus." });
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `❌ Method ${method} tidak diizinkan.` });
    }
  } catch (err) {
    console.error("❌ Error booking:", err.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: "❌ Terjadi kesalahan server.", details: err.message });
    }
  }
};
