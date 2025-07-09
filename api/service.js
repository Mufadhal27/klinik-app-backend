const mongoose = require("mongoose");
const Service = require("../models/Service");

let isConnected = false;

const dbConnect = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
};

// Fungsi untuk parsing body di Vercel
const parseBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
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

// Fungsi untuk ambil query dari URL
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
      const services = await Service.find();
      return res.status(200).json(services);
    }

    if (method === "POST") {
      const body = await parseBody(req);
      const newService = new Service(body);
      await newService.save();
      return res.status(201).json(newService);
    }

    if (method === "PUT") {
      const body = await parseBody(req);
      const updated = await Service.findByIdAndUpdate(query.id, body, { new: true });
      return res.status(200).json(updated);
    }

    if (method === "DELETE") {
      await Service.findByIdAndDelete(query.id);
      return res.status(200).json({ message: "Layanan berhasil dihapus." });
    }

    return res.status(405).json({ message: "Method tidak diizinkan." });

  } catch (err) {
    console.error("❌ Error di /api/service:", err);
    return res.status(500).json({ error: err.message });
  }
};
