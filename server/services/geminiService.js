// server/services/geminiService.js
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseCVText = async (rawText) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
    Aşağıda ham metni verilen CV'yi analiz et ve istenen JSON şemasına uygun olarak ayrıştır.
    Eğer bir bilgi yoksa null veya boş bırakabilirsin. Tarihleri (startDate, endDate) anlayabildiğin en iyi formata (örn: YYYY-MM) çevir.
    
    İstenen JSON Formatı:
    {
      "summary": "Adayın geçmişi, yetenekleri ve hedefleri hakkında profesyonel özet (Türkçe).",
      "entries": [
        {
          "category": "EXPERIENCE | EDUCATION | SKILL | PROJECT | LANGUAGE | CERTIFICATE | CONTACT_INFO | OTHER",
          "title": "Şirket Adı, Okul Adı, Yetenek Adı, Proje Adı, Dil Adı vb.",
          "subtitle": "Unvan (Rol), Bölüm (Degree), Seviye vb.",
          "startDate": "YYYY-MM formatında başlangıç tarihi (yoksa null)",
          "endDate": "YYYY-MM formatında bitiş tarihi veya 'Present' (yoksa null)",
          "description": "Detaylı açıklamalar, sorumluluklar veya kazanımlar",
          "metadata": { "ekstra_bilgi_anahtari": "degeri" } 
        }
      ]
    }

    CV Ham Metni:
    """${rawText}"""
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();

    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Gemini Parse Hatası:", error);
    throw new Error("CV ayrıştırılamadı.");
  }
};

module.exports = { parseCVText };