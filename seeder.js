const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Service = require("./models/Service"); 
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Service.deleteMany(); 

  await Service.insertMany([
    {
      nama: "Konsultasi Umum",
      deskripsi: "Layanan konsultasi umum untuk segala jenis keluhan ringan.",
      harga: 50000
    },
    {
      nama: "Pemeriksaan Jantung",
      deskripsi: "Pemeriksaan detak jantung dan tekanan darah.",
      harga: 75000
    },
    {
      nama: "Cek Gula Darah",
      deskripsi: "Tes kadar gula darah cepat dan akurat.",
      harga: 30000
    },
    {
    "nama": "Vaksinasi Umum",
    "deskripsi": "Layanan vaksinasi untuk anak-anak, dewasa, dan lansia sesuai kebutuhan imunisasi.",
    "harga": 120000
    },
    {
    "nama": "Tes Kehamilan",
    "deskripsi": "Pemeriksaan kehamilan cepat dan akurat dengan test pack dan konsultasi dokter.",
    "harga": 45000
    },
    {
    "nama": "Tes Urin Lengkap",
    "deskripsi": "Analisis urin untuk mendeteksi infeksi saluran kemih, diabetes, dan gangguan ginjal.",
    "harga": 60000
    },
    {
    "nama": "Tes Darah Lengkap",
    "deskripsi": "Pemeriksaan lengkap untuk hemoglobin, leukosit, trombosit, dan indikator kesehatan lainnya.",
    "harga": 90000
    },
    {
    "nama": "Konsultasi Dokter Spesialis",
    "deskripsi": "Layanan konsultasi dengan spesialis anak, kulit, gizi, atau penyakit dalam.",
    "harga": 150000
    },
    {
    "nama": "Pemeriksaan Demam Berdarah",
    "deskripsi": "Tes cepat untuk mendeteksi virus DBD dengan hasil dalam hitungan menit.",
    "harga": 70000
    },
    {
    "nama": "Tes Kolesterol",
    "deskripsi": "Tes profil lipid untuk mengetahui kadar kolesterol total, HDL, LDL, dan trigliserida.",
    "harga": 40000
    },
    {
    "nama": "Pemeriksaan Anak Sehat",
    "deskripsi": "Pemeriksaan rutin untuk memantau tumbuh kembang anak bersama dokter anak.",
    "harga": 60000
    }

  ]);

  console.log("✅ Dummy layanan berhasil dimasukkan!");
  process.exit();
});
