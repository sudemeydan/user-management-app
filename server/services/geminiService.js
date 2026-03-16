// server/services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const withRetry = async (fn, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const is429 = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Too Many Requests');
      if (is429 && attempt < maxRetries) {
        const waitSec = attempt * 10;
        console.log(`Gemini rate limit aşıldı, ${waitSec}s beklenip tekrar denenecek (deneme ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
      } else {
        throw error;
      }
    }
  }
};

const cleanAndParseJSON = (jsonString) => {
  try {
    const cleaned = jsonString.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON Parse Hatası. Ham Metin:", jsonString);
    throw new Error("Gemini yanıtı geçerli bir JSON formatında değil.");
  }
};

const parseCVText = async (rawText) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Senin listende olan model
      generationConfig: { responseMimeType: "application/json" },
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

    const result = await withRetry(() => model.generateContent(prompt));
    const response = await result.response;
    return cleanAndParseJSON(response.text());
  } catch (error) {
    console.error("Gemini Parse Hatası:", error);
    throw new Error("CV ayrıştırılamadı.");
  }
};

const analyzeATSCompatibility = async (rawText) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    Aşağıda ham metni verilen CV'yi ATS (Aday Takip Sistemi) uyumluluğu açısından analiz et.
    Metnin yapısına, karmaşıklığına ve standartlara uygunluğuna bakarak bir skor ve geri bildirim ver.
    Özellikle sütunlu yapılar (metnin birbirine girmesi), karmaşık fontlar veya eksik standart bölümler (İletişim, Deneyim, Eğitim) olup olmadığını değerlendir.

    İstenen JSON Formatı:
    {
      "score": 0 ile 100 arasında bir tam sayı,
      "feedback": "Kullanıcıya yönelik samimi ve profesyonel bir geri bildirim (Türkçe)."
    }

    CV Ham Metni:
    """${rawText}"""
    `;

    const result = await withRetry(() => model.generateContent(prompt));
    const response = await result.response;
    return cleanAndParseJSON(response.text());
  } catch (error) {
    console.error("Gemini ATS Analiz Hatası:", error);
    return { score: 50, feedback: "Analiz sırasında bir hata oluştu, ancak şablonunuzu gözden geçirmekte fayda olabilir." };
  }
};

const extractJobDetails = async (jobText) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    Aşağıda verilen iş ilanı metnini analiz et. İlandaki en kritik yetenekleri, deneyim sürelerini ve temel gereksinimleri çıkar.
    
    İstenen JSON Formatı:
    {
      "title": "İş Unvanı",
      "company": "Şirket Adı (metinde varsa, yoksa null)",
      "skills": ["yetenek1", "yetenek2"],
      "requirements": ["gereksinim1", "gereksinim2"],
      "summary": "İşin kısa ve vurucu bir özeti (Türkçe)."
    }

    İş İlanı Metni:
    """${jobText}"""
    `;

    const result = await withRetry(() => model.generateContent(prompt));
    const response = await result.response;
    return cleanAndParseJSON(response.text());
  } catch (error) {
    console.error("Gemini Job Extraction Hatası:", error);
    throw new Error("İş ilanı analiz edilemedi.");
  }
};

const generateTailoringProposals = async (cvData, jobData) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    Bir İK uzmanı gibi davran. Adayın CV'sini hedef iş ilanı ile karşılaştır. 
    Hangi bölümlerde (summary, experience, skills) değişiklik yapılırsa adayın işe girme şansı artar?
    
    Her değişiklik önerisi için bir neden (aiComment) belirt. 

    Adayın CV Verileri (JSON):
    ${JSON.stringify(cvData)}

    Hedef İş İlanı Verileri (JSON):
    ${JSON.stringify(jobData)}

    İstenen Çıktı Formatı:
    {
      "improvedSummary": "CV'nin başındaki özet kısmının işe uygun hali",
      "proposals": [
        {
          "entryId": "CV'deki entry'nin ID'si",
          "category": "EXPERIENCE | SKILL | PROJECT vb.",
          "suggestedTitle": "Önerilen Başlık (gerekirse)",
          "suggestedDescription": "Önerilen yeni açıklama (ilandaki anahtar kelimeleri içeren)",
          "aiComment": "Açıklama"
        }
      ]
    }
    `;

    const result = await withRetry(() => model.generateContent(prompt));
    const response = await result.response;
    return cleanAndParseJSON(response.text());
  } catch (error) {
    console.error("Gemini Tailoring Proposal Hatası:", error);
    throw new Error("Uyarlama önerileri oluşturulamadı.");
  }
};

module.exports = {
  parseCVText,
  analyzeATSCompatibility,
  extractJobDetails,
  generateTailoringProposals
};