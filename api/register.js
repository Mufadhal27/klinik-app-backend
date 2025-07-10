const dbConnect = require("../utils/dbConnect");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

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
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
            const { username, email, password } = req.body;

            // Input Validation
            if (!username || !email || !password) {
                return res.status(400).json({ error: "Username, email, dan password harus diisi." });
            }

            // Check Existing User/Email
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return res.status(409).json({ error: "Username atau email sudah terdaftar." });
            }

            // Hash Password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create New User
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                role: 'user'
            });

            // Save User to DB
            await newUser.save();

            // Success Response
            return res.status(201).json({ message: "Registrasi berhasil!", userId: newUser._id });

        } catch (error) {
            console.error("❌ Error saat registrasi:", error.message);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: "Terjadi kesalahan saat registrasi." });
        }
    } else {
        // Method Not Allowed
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};