const dbConnect = require("../utils/dbConnect");
const User = require("../models/User");
const bcrypt = require("bcryptjs"); // Untuk membandingkan password
const jwt = require("jsonwebtoken"); // Untuk membuat JWT

module.exports = async function handler(req, res) {
    // CORS Configuration
    const allowedOrigins = [
        "https://klinik-app-frontend.vercel.app",
    ];
    const origin = req.headers.origin;
    const isVercelPreviewOrigin = origin && origin.endsWith("-mufadhals-projects.vercel.app");

    if (allowedOrigins.includes(origin) || isVercelPreviewOrigin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Tambahkan Authorization untuk header nanti

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    // End CORS Configuration

    // Database Connection
    try {
        await dbConnect();
    } catch (err) {
        console.error("❌ Gagal koneksi database:", err.message);
        return res.status(500).json({ error: "❌ Gagal koneksi database." });
    }

    if (req.method === "POST") {
        try {
            const { email, password } = req.body;

            // Input Validation
            if (!email || !password) {
                return res.status(400).json({ error: "Email dan password harus diisi." });
            }

            // Find User by Email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: "Kredensial tidak valid (email)." }); // Jangan spesifik ke email/pass untuk keamanan
            }

            // Compare Password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Kredensial tidak valid (password)." }); // Jangan spesifik ke email/pass untuk keamanan
            }

            // Generate JWT Token
            const payload = {
                user: {
                    id: user.id, // ID pengguna dari MongoDB
                    role: user.role // Sertakan role untuk otorisasi nanti
                }
            };

            // Mengatur masa berlaku token
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET, // Kunci rahasia dari Environment Variable
                { expiresIn: '30m' } // Token akan kadaluarsa dalam 30 menit
            );

            // Success Response with Token
            return res.status(200).json({ token });

        } catch (error) {
            console.error("❌ Error saat login:", error.message);
            return res.status(500).json({ error: "Terjadi kesalahan saat login." });
        }
    } else {
        // Method Not Allowed
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};