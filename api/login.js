const dbConnect = require("../utils/dbConnect");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = async function handler(req, res) {
    // ✅ Full CORS Configuration
    const allowedOrigins = [
        "https://klinik-app-frontend.vercel.app", // GANTI dengan frontend production kamu
    ];
    const origin = req.headers.origin;
    const isVercelPreviewOrigin = origin && origin.endsWith("-mufadhals-projects.vercel.app");

    if (allowedOrigins.includes(origin) || isVercelPreviewOrigin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Koneksi Database
    try {
        await dbConnect();
    } catch (err) {
        console.error("❌ Gagal koneksi database:", err.message);
        return res.status(500).json({ error: "❌ Gagal koneksi database." });
    }

    if (req.method === "POST") {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email dan password harus diisi." });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: "Kredensial tidak valid." });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Kredensial tidak valid." });
            }

            const payload = {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30m" });

            return res.status(200).json({ token });

        } catch (error) {
            console.error("❌ Error during login:", error.message);
            return res.status(500).json({ error: "Terjadi kesalahan saat login." });
        }
    } else {
        res.setHeader("Allow", ["POST", "OPTIONS"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
