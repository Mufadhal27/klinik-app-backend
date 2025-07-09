const mongoose = require("mongoose");
const Booking = require("../models/Booking");

let isConnected = false;

const dbConnect = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
};

// Parse body (karena tidak pakai Express)
const parseBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
};

// Ambil query dari URL
const getQuery = (req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  return Object.fromEntries(url.searchParams.entries());
};

module.exports = async (req, res) => {
  await dbConnect();
  const method = req.method;
  const query = getQuery(req);

  try {
    if (method === "GET") {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      return res.status(200).json(bookings);
    }

    if (method === "POST") {
      const body = await parseBody(req);
      const booking = new Booking(body);
      await booking.save();
      return res.status(201).json({ message: "Booking berhasil!", booking });
    }

    if (method === "PUT") {
      const body = await parseBody(req);
      const updated = await Booking.findByIdAndUpdate(query.id, body, { new: true });
      return res.status(200).json(updated);
    }

    if (method === "DELETE") {
      await Booking.findByIdAndDelete(query.id);
      return res.status(200).json({ message: "Booking berhasil dihapus." });
    }

    return res.status(405).json({ message: "Method tidak diizinkan." });

  } catch (err) {
    console.error("❌ Error di /api/booking:", err);
    return res.status(500).json({ error: err.message });
  }
};
