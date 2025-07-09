const dbConnect = require("../utils/dbConnect");
const Service = require("../models/Service");

module.exports = async (req, res) => {
  await dbConnect();
  const { method } = req;

  if (method === "GET") {
    try {
      const services = await Service.find();
      return res.status(200).json(services);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === "POST") {
    try {
      const newService = new Service(req.body);
      await newService.save();
      return res.status(201).json(newService);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if (method === "PUT") {
    try {
      const updated = await Service.findByIdAndUpdate(req.query.id, req.body, { new: true });
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if (method === "DELETE") {
    try {
      await Service.findByIdAndDelete(req.query.id);
      return res.status(200).json({ message: "Layanan berhasil dihapus." });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ message: "Method tidak diizinkan." });
};
