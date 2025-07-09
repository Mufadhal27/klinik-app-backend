const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method tidak diizinkan. Gunakan POST." });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Pesan tidak valid" });
  }

  const text = prompt.toLowerCase();
  const forbiddenWords = ["game", "film", "anime", "politik", "presiden", "pacar", "artis", "musik"];
  const containsForbidden = forbiddenWords.some(word => text.includes(word));

  if (containsForbidden) {
    return res.status(403).json({
      response: "❌ Maaf, saya hanya bisa menjawab hal-hal seputar kesehatan, bukan topik lain seperti hiburan atau politik."
    });
  }

  try {
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
    res.status(500).json({ error: "Gagal mendapatkan jawaban dari Gemini" });
  }
};
