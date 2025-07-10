const dbConnect = require("../utils/dbConnect");
const Service = require("../models/Service");

module.exports = async function handler(req, res) {
    const allowedOrigins = [
        "https://klinik-app-frontend.vercel.app",
    ];
    const origin = req.headers.origin;
    const isVercelPreviewOrigin = origin && origin.endsWith("-mufadhals-projects.vercel.app");

    if (allowedOrigins.includes(origin) || isVercelPreviewOrigin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        await dbConnect();
    } catch (err) {
        console.error("❌ Gagal koneksi database:", err.message);
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
                if (!updated) {
                    return res.status(404).json({ error: "❌ Layanan tidak ditemukan." });
                }
                return res.status(200).json(updated);

            case "DELETE":
                if (!query.id) {
                    return res.status(400).json({ error: "❌ ID layanan diperlukan." });
                }
                const deleted = await Service.findByIdAndDelete(query.id);
                if (!deleted) {
                    return res.status(404).json({ error: "❌ Layanan tidak ditemukan." });
                }
                return res.status(200).json({ message: "✅ Layanan berhasil dihapus." });

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ error: `❌ Method ${method} tidak diizinkan.` });
        }
    } catch (err) {
        console.error("❌ Terjadi error di API Service:", err.message);
        return res.status(500).json({ error: "❌ Terjadi kesalahan saat memproses permintaan." });
    }
};