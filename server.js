const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// --- PERBAIKAN: Tambahkan polyfill untuk fetch dan komponen Fetch API ---
// Karena Glitch kemungkinan menggunakan Node.js versi lama yang tidak memiliki globalThis
// atau fetch global secara native, kita hanya akan menggunakan 'global' untuk polyfill.
const fetch = require("node-fetch"); // Import node-fetch di sini
if (typeof global !== 'undefined') {
  if (!global.fetch) global.fetch = fetch;
  if (!global.Headers) global.Headers = fetch.Headers;
  if (!global.Request) global.Request = fetch.Request;
  if (!global.Response) global.Response = fetch.Response;
}
// -----------------------------------------------------------------------

// Memuat variabel lingkungan dari file .env
dotenv.config();

// Import Routes
const bookingRoutes = require("./routes/bookingsRoute");
const chatsRoute = require("./routes/chatsRoute");
const servicesRoute = require("./routes/servicesRoute");

const app = express();

// ✅ Konfigurasi CORS yang fleksibel (lokal, vercel, postman, railway)
// Sesuaikan daftar origins ini sesuai dengan domain frontend Anda saat di-deploy
const allowedOrigins = [
  "http://localhost:5173", // Vite local dev
  "http://localhost:3000", // Jika pakai React CRA
  "https://klinik-*-mufadhals-projects.vercel.app", // <-- WILDCARD INI MENCakup URL VERCEL PREVIEW
  "https://*.glitch.me", // Jika frontend atau testing dari Glitch
];

const corsOptions = {
  origin: function (origin, callback) {
    // Memungkinkan permintaan tanpa origin (misalnya dari Postman atau file lokal)
    if (!origin) return callback(null, true);

    // Memeriksa apakah origin ada dalam daftar yang diizinkan
    // Menggunakan regex untuk mencocokkan wildcard
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const regex = new RegExp(`^${allowedOrigin.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      return callback(null, true);
    } else {
      // Jika origin tidak diizinkan, kembalikan error
      return callback(new Error(`❌ Akses tidak diizinkan oleh CORS dari origin: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Mengizinkan pengiriman cookies atau header otorisasi
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware untuk parsing body JSON dari request

// --- Tambahkan rute GET untuk root URL di sini ---
app.get("/", (req, res) => {
  res.status(200).send("Server backend Anda berjalan dengan baik!");
});
// -------------------------------------------------

// ✅ Routes
// Menghubungkan route ke aplikasi Express
app.use("/services", servicesRoute);
app.use("/bookings", bookingRoutes);
app.use("/api/chats", chatsRoute); // Prefix /api/chats untuk route chatbot

// ✅ Koneksi MongoDB + Server Start
// Koneksi ke MongoDB menggunakan URI dari variabel lingkungan
const MONGO_URI = process.env.MONGO_URI; // Ambil MONGO_URI di sini

if (!MONGO_URI) {
  console.error("❌ MONGO_URI tidak ditemukan. Cek environment variable Glitch.");
  process.exit(1); // Keluar dari aplikasi jika MONGO_URI tidak ada
}

mongoose.connect(MONGO_URI, { // Gunakan MONGO_URI yang sudah diambil
  // --- OPSI BARU UNTUK MENGHILANGKAN PERINGATAN ---
  useNewUrlParser: true,      // Mengatasi DeprecationWarning: current URL string parser
  useUnifiedTopology: true,   // Mengatasi DeprecationWarning: Current Server Discovery and Monitoring engine
  // --- Opsi lama yang mungkin sudah Anda miliki (jika ada) ---
  // bufferCommands: false, // Opsi ini tidak diperlukan di Mongoose 5.x dengan useUnifiedTopology
  // serverSelectionTimeoutMS: 5000, // Opsi ini tidak diperlukan di Mongoose 5.x dengan useUnifiedTopology
  // socketTimeoutMS: 45000, // Opsi ini tidak diperlukan di Mongoose 5.x dengan useUnifiedTopology
})
  .then(() => {
    // Jika koneksi database berhasil
    console.log("✅ MongoDB Connected Successfully!"); // Pesan koneksi MongoDB yang eksplisit

    const PORT = process.env.PORT || 5000; // Mengambil port dari .env atau default ke 5000
    app.listen(PORT, () => {
      // Server Express mulai mendengarkan
      console.log(`✅ Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // Jika koneksi database gagal
    console.error("❌ Gagal konek DB:", err);
    process.exit(1); // Menghentikan proses aplikasi jika koneksi DB gagal
  });
