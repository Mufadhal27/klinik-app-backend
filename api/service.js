const dbConnect = require("../utils/dbConnect");
const Service = require("../models/Service");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await dbConnect();
  } catch (error) {
    return res.status(500).json({ error: "Gagal koneksi database." });
  }

  const method = req.method;

  switch (method) {
    case "GET":
      try {
        const services = await Service.find();
        return res.status(200).json(services);
      } catch (err) {
        return res.status(500).json({ error: "Gagal mengambil layanan." });
      }

    case "POST":
      try {
        if (!req.body || Object.keys(req.body).length === 0) {
          return res.status(400).json({ error: "Data layanan tidak boleh kosong." });
        }

        const newService = new Service(req.body);
        await newService.save();
        return res.status(201).json(newService);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }

    case "PUT":
      try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: "ID layanan diperlukan." });

        const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json(updated);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }

    case "DELETE":
      try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: "ID layanan diperlukan." });

        await Service.findByIdAndDelete(id);
        return res.status(200).json({ message: "Layanan berhasil dihapus." });
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }

    default:
      return res.status(405).json({ error: "Method tidak diizinkan." });
  }
};
