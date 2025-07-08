const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const fetch = require("node-fetch"); 
if (typeof global !== 'undefined') {
  if (!global.fetch) global.fetch = fetch;
  if (!global.Headers) global.Headers = fetch.Headers;
  if (!global.Request) global.Request = fetch.Request;
  if (!global.Response) global.Response = fetch.Response;
}

dotenv.config();

// Import Routes
const bookingRoutes = require("./routes/bookingsRoute");
const chatsRoute = require("./routes/chatsRoute");
const servicesRoute = require("./routes/servicesRoute");

const app = express();

const allowedOrigins = [
  "http://localhost:5173", // Vite local dev
  "http://localhost:3000", // Jika pakai React CRA
  "https://klinik-*-mufadhals-projects.vercel.app", 
  "https://*.glitch.me", 
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

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
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json()); 

// Tambahkan rute GET untuk root URL di sini 
app.get("/", (req, res) => {
  res.status(200).send("Server backend Anda berjalan dengan baik!");
});

// Menghubungkan route ke aplikasi Express
app.use("/services", servicesRoute);
app.use("/bookings", bookingRoutes);
app.use("/api/chats", chatsRoute); 

// Koneksi ke MongoDB menggunakan URI dari variabel lingkungan
const MONGO_URI = process.env.MONGO_URI; 

if (!MONGO_URI) {
  console.error("❌ MONGO_URI tidak ditemukan. Cek environment variable Glitch.");
  process.exit(1); 
}

mongoose.connect(MONGO_URI, { 
  useNewUrlParser: true,      
  useUnifiedTopology: true,   
})
  .then(() => {
    // Jika koneksi database berhasil
    console.log("✅ MongoDB Connected Successfully!"); 

    const PORT = process.env.PORT || 5000; 
    app.listen(PORT, () => {
      console.log(`✅ Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // Jika koneksi database gagal
    console.error("❌ Gagal konek DB:", err);
    process.exit(1); 
  });
