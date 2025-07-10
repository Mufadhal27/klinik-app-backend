const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = async function handler(req, res) {
  const allowedOrigins = [
    "https://klinik-app-frontend.vercel.app",
  ];
  const origin = req.headers.origin;
  const isVercelPreviewOrigin = origin && origin.endsWith("-mufadhals-projects.vercel.app");

  if (allowedOrigins.includes(origin) || isVercelPreviewOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Gunakan metode POST." });
  }

  try {
    const body = await parseBody(req);
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt tidak valid." });
    }

    const forbiddenWords = [
      "game", "film", "anime", "politik", "presiden", "pacar", "artis", "musik"
    ];

    if (forbiddenWords.some(word => prompt.toLowerCase().includes(word))) {
      return res.status(403).json({
        response: "❌ Maaf, saya hanya bisa menjawab hal-hal seputar kesehatan."
      });
    }

    const instruction = `
      Jawab langsung pertanyaan user tentang kesehatan, tanpa pengantar atau perkenalan.
      Gunakan gaya bahasa yang sopan dan profesional.
      Fokus pada informasi medis seperti gejala, penyakit, obat, tindakan, dan saran medis ringan.
      Jangan gunakan HTML, markdown, atau simbol format seperti <b> atau * — cukup teks biasa saja.
    `;

    const result = await model.generateContent([instruction.trim(), prompt]);
    const response = await result.response;
    const plainText = await response.text();

    return res.status(200).json({ response: plainText.trim() });
  } catch (err) {
    console.error("❌ Error Gemini:", err);
    return res.status(500).json({ error: "Gagal memproses permintaan." });
  }
};