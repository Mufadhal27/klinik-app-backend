const mongoose = require("mongoose");

let isConnected;

const dbConnect = async () => {
  if (isConnected) {
    console.log("🔁 Sudah terhubung ke MongoDB");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = conn.connections[0].readyState;
    console.log("✅ Terhubung ke MongoDB");
  } catch (error) {
    console.error("❌ Gagal konek MongoDB:", error);
    throw error;
  }
};

module.exports = dbConnect;
