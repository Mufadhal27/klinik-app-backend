const dbConnect = require("../utils/dbConnect");
const Service = require("../models/Service");

module.exports = async (req, res) => {
  await dbConnect();

  const { method, query, body } = req;

  try {
    if (method === "GET") {
      const services = await Service.find();
      return res.status(200).json(services);
    }

    if (method === "POST") {
      const newService = new Service(body);
      await newService.save();
      return res.status(201).json(newService);
    }

    if (method === "PUT") {
      const updated = await Service.findByIdAndUpdate(query.id, body, { new: true });
      return res.status(200).json(updated);
    }

    if (method === "DELETE") {
      await Service.findByIdAndDelete(query.id);
      return res.status(200).json({ message: "Layanan berhasil dihapus." });
    }

    return res.status(405).json({ message: "Method tidak diizinkan." });
  } catch (err) {
    console.error("❌ Service Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
