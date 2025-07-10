const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Nama pengguna harus unik
        trim: true,   // Menghapus spasi di awal/akhir
        minlength: 3  // Minimal 3 karakter
    },
    email: {
        type: String,
        required: true,
        unique: true, // Email harus unik
        trim: true,
        lowercase: true, // Simpan email dalam huruf kecil
        match: [/.+@.+\..+/, 'Please fill a valid email address'] // Validasi format email
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimal 6 karakter
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Hanya bisa 'user' atau 'admin'
        default: 'user' // Defaultnya adalah user biasa
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;