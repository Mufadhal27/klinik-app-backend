const dbConnect = require("../utils/dbConnect");
const Service = require("../models/Service");

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // handle preflight
  }

  // Connect DB
  try {
    await dbConnect();
  } catch (err) {
    return res.status(500).json({ error: "❌ Gagal koneksi database." });
  }

  const { method, query, body } = req;

  try {
    switch (method) {
      case "GET":
        const services = await Service.find();
        return res.status(200).json(services);

      case "POST":
        if (!body || Object.keys(body).length === 0) {
          return res.status(400).json({ error: "❌ Data layanan tidak boleh kosong." });
        }
        const created = await new Service(body).save();
        return res.status(201).json(created);

      case "PUT":
        if (!query.id) {
          return res.status(400).json({ error: "❌ ID layanan diperlukan." });
        }
        const updated = await Service.findByIdAndUpdate(query.id, body, { new: true });
        return res.status(200).json(updated);

      case "DELETE":
        if (!query.id) {
          return res.status(400).json({ error: "❌ ID layanan diperlukan." });
        }
        await Service.findByIdAndDelete(query.id);
        return res.status(200).json({ message: "✅ Layanan berhasil dihapus." });

      default:
        return res.status(405).json({ error: "❌ Method tidak diizinkan." });
    }
  } catch (err) {
    console.error("❌ Terjadi error:", err.message);
    return res.status(500).json({ error: "❌ Terjadi kesalahan saat memproses permintaan." });
  }
};
