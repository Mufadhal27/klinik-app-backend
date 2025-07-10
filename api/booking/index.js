const dbConnect = require("../utils/dbConnect");
const Booking = require("../models/Booking");
const protect = require('../../middleware/protect'); 
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
        const allBookings = await Booking.find({}); // Mengambil semua booking
        return res.status(200).json(allBookings);

      case "POST":
        // Panggil middleware protect untuk memastikan user sudah login
        await protect(req, res, async () => { 
          const { serviceName, bookingDate, bookingTime, userName, userEmail, userPhone, notes } = body || {};
          const userId = req.user.id; 

          // 1. Validasi Input Dasar
          if (!serviceName || !bookingDate || !bookingTime || !userName || !userEmail || !userPhone) {
            return res.status(400).json({ error: "❌ Semua field wajib diisi." });
          }

          // 2. Validasi Format Tanggal dan Jam
          const fullDateTimeString = `${bookingDate} ${bookingTime}`; 
          const bookingMoment = moment(fullDateTimeString, 'YYYY-MM-DD HH:mm', true); 

          if (!bookingMoment.isValid()) {
            return res.status(400).json({ error: "❌ Format tanggal atau jam tidak valid. Gunakan YYYY-MM-DD dan HH:mm." });
          }

          // 3. Validasi Jam Operasional (08:00 - 20:00)
          const operationalStartHour = 8;
          const operationalEndHour = 20; 
          const bookingHour = bookingMoment.hour();
          const bookingMinutes = bookingMoment.minute();

          if (bookingHour < operationalStartHour || bookingHour >= operationalEndHour) {
            return res.status(400).json({ error: `❌ Booking hanya dapat dilakukan antara pukul ${operationalStartHour}:00 hingga ${operationalEndHour}:00.` });
          }

          // 4. Validasi Slot Waktu (+/- 15 menit)
          const fifteenMinutesBefore = bookingMoment.clone().subtract(15, 'minutes');
          const fifteenMinutesAfter = bookingMoment.clone().add(15, 'minutes');

          const existingBookings = await Booking.find({
            bookingDate: new Date(bookingMoment.format('YYYY-MM-DD')), // Query berdasarkan tanggal saja
            bookingTime: {
              // Mencari booking yang waktunya tumpang tindih
              // Convert moment objects to HH:mm strings for comparison if bookingTime is string
              $gte: fifteenMinutesBefore.format('HH:mm'), // Dari 15 menit sebelum waktu yang diminta
              $lte: fifteenMinutesAfter.format('HH:mm') // Sampai 15 menit setelah waktu yang diminta
            }
          });

          if (existingBookings.length > 0) {
            return res.status(409).json({ message: '❌ Slot waktu ini atau di sekitarnya sudah terisi. Mohon pilih waktu lain.' });
          }

          // 5. Buat Booking
          const createdBooking = await Booking.create({
            userId, 
            serviceName,
            bookingDate: new Date(bookingDate),
            bookingTime, 
            userName,
            userEmail,
            userPhone,
            notes
          });

          return res.status(201).json({ message: "✅ Booking berhasil dibuat.", booking: createdBooking });
        });
        break; 

      case "PUT":
        await protect(req, res, async () => {
          if (!query.id) {
            return res.status(400).json({ error: "❌ ID booking diperlukan." });
          }
          const bookingId = query.id;
          const userId = req.user.id; // User yang sedang login

          const { serviceName, bookingDate, bookingTime, userName, userEmail, userPhone, notes } = body || {};

          // Validasi input yang akan diupdate
          if (!serviceName || !bookingDate || !bookingTime || !userName || !userEmail || !userPhone) {
            return res.status(400).json({ error: "❌ Semua field wajib diisi untuk update." });
          }

          // Cek apakah booking ini milik user yang sedang login
          const existingBooking = await Booking.findOne({ _id: bookingId, userId });
          if (!existingBooking) {
            return res.status(404).json({ error: "❌ Booking tidak ditemukan atau Anda tidak memiliki izin untuk mengeditnya." });
          }

          // 1. Validasi Format Tanggal dan Jam untuk Update
          const fullDateTimeString = `${bookingDate} ${bookingTime}`;
          const bookingMoment = moment(fullDateTimeString, 'YYYY-MM-DD HH:mm', true);

          if (!bookingMoment.isValid()) {
            return res.status(400).json({ error: "❌ Format tanggal atau jam tidak valid untuk update. Gunakan YYYY-MM-DD dan HH:mm." });
          }

          // 2. Validasi Jam Operasional untuk Update
          const operationalStartHour = 8;
          const operationalEndHour = 20;
          const bookingHour = bookingMoment.hour();
          const bookingMinutes = bookingMoment.minute();

          if (bookingHour < operationalStartHour || bookingHour >= operationalEndHour) {
            return res.status(400).json({ error: `❌ Booking hanya dapat dilakukan antara pukul ${operationalStartHour}:00 hingga ${operationalEndHour}:00.` });
          }

          // 3. Validasi Slot Waktu (+/- 15 menit) untuk Update 
          const fifteenMinutesBefore = bookingMoment.clone().subtract(15, 'minutes');
          const fifteenMinutesAfter = bookingMoment.clone().add(15, 'minutes');

          const conflictingBookings = await Booking.find({
            _id: { $ne: bookingId }, 
            bookingDate: new Date(bookingMoment.format('YYYY-MM-DD')),
            bookingTime: {
              $gte: fifteenMinutesBefore.format('HH:mm'),
              $lte: fifteenMinutesAfter.format('HH:mm')
            }
          });

          if (conflictingBookings.length > 0) {
            return res.status(409).json({ message: '❌ Slot waktu baru ini atau di sekitarnya sudah terisi. Mohon pilih waktu lain.' });
          }

          // Lakukan update
          const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            {
              serviceName,
              bookingDate: new Date(bookingDate),
              bookingTime,
              userName,
              userEmail,
              userPhone,
              notes
            },
            { new: true, runValidators: true }
          );

          if (!updatedBooking) {
            return res.status(404).json({ error: "❌ Booking tidak ditemukan setelah update." });
          }

          return res.status(200).json({ message: "✅ Booking berhasil diperbarui.", booking: updatedBooking });
        });
        break;

      case "DELETE":
        await protect(req, res, async () => {
          if (!query.id) {
            return res.status(400).json({ error: "❌ ID booking harus disediakan." });
          }
          const bookingId = query.id;
          const userId = req.user.id; 

          // Hapus booking hanya jika itu milik user yang sedang login
          const deletedBooking = await Booking.findOneAndDelete({ _id: bookingId, userId });

          if (!deletedBooking) {
            return res.status(404).json({ error: "❌ Booking tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya." });
          }

          return res.status(200).json({ message: "✅ Booking berhasil dihapus." });
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `❌ Method ${method} tidak diizinkan.` });
    }
  } catch (err) {
    console.error("❌ Error Booking:", err.message);

    if (!res.headersSent) {
      return res.status(500).json({ error: "❌ Terjadi kesalahan server saat memproses permintaan.", details: err.message });
    }
  }
};