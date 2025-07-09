const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Fungsi untuk parse body request di Vercel
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Gunakan metode POST." });
  }

  try {
    const body = await parseBody(req);
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt tidak valid." });
    }

    const text = prompt.toLowerCase();
    const forbiddenWords = [
      "game", "film", "anime", "politik", "presiden", "pacar", "artis", "musik"
    ];

    const containsForbidden = forbiddenWords.some(word => text.includes(word));
    if (containsForbidden) {
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

    res.status(200).json({ response: plainText.trim() });
  } catch (err) {
    console.error("❌ Error Gemini:", err);
    res.status(500).json({ error: "Gagal memproses permintaan." });
  }
};
