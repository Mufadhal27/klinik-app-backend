const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.askGemini = async (req, res) => {
  const { prompt } = req.body; 

  if (!prompt || typeof prompt !== "string") { 
    return res.status(400).json({ error: "Pesan tidak valid" });
  }

  const text = prompt.toLowerCase(); 

  const forbiddenWords = [
    "game", "film", "anime", "politik", "presiden", "pacar", "artis", "musik"
  ];

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
    Jangan gunakan HTML, markdown, atau simbol format seperti <b> atau * — cukup teks biasa saja. Jangan ada bahas tentang html dan lainnya, pokoknya 
    fokus ke kesehatan aja.
    Jika pertanyaan di luar topik kesehatan, tolak dengan sopan.
    `;

    const result = await model.generateContent([instruction.trim(), prompt]); 
    const response = await result.response;
    let html = await response.text();

    
    html = html
      .replace(/<!DOCTYPE html>/gi, "")
      .replace(/<html[^>]*>/gi, "")
      .replace(/<\/html>/gi, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
      .replace(/<body[^>]*>/gi, "")
      .replace(/<\/body>/gi, "")
      .trim();

    res.json({ response: html });
  } catch (err) {
    console.error("❌ Error Gemini:", err);
    res.status(500).json({ error: "Gagal mendapatkan jawaban dari Gemini" });
  }
};
