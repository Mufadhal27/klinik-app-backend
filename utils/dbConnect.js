const mongoose = require("mongoose");

let isConnected;

const dbConnect = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = conn.connections[0].readyState;
  } catch (error) {
    console.error("❌ Gagal konek MongoDB:", error.message);
    throw new Error("Gagal koneksi database.");
  }
};

module.exports = dbConnect;
