const mongoose = require("mongoose");

let isConnected;

const dbConnect = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = conn.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw new Error("Gagal koneksi MongoDB");
  }
};

module.exports = dbConnect;
