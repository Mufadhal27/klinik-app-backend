const Service = require("../models/Service");

// GET semua layanan
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST tambah layanan
exports.createService = async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT update layanan
exports.updateService = async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE layanan
exports.deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Layanan berhasil dihapus." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
