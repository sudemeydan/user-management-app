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
    
    ÖNEMLİ KURALLAR:
    1. Metin PDF'den çıkarıldığı için kolonlar veya tablolar birbirine karışmış olabilir. Bağlamı (Experience, Education vs.) iyi analiz et ve mantıksal sıraları eşleştir.
    2. İsim, e-posta, telefon gibi verileri mutlaka CONTACT_INFO kategorisine ekle ve metadata içine 'fullName' anahtarını eksiksiz doldur.
    3. Uzun bullet-point listeleri veya kopuk paragrafları anlamlı bir şekilde birleştirerek (gerekirse madde işaretlerini kullanarak) 'description' içine koy.
    4. Yabancı dilde olan açıklamaları da en iyi şekilde aynı dilde koruyarak ama anlaşılır bir yapıda JSON'a çevir.
    
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
          "metadata": { "fullName": "Adayın Tam Adı (SADECE CONTACT_INFO İÇİN ZORUNLU)", "email": "...", "phone": "..." } 
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

const generateTailoringProposals = async (cv, jobDescription) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // Sadece Gemini'ye anlamlı alanları gönder (ham DB objesi değil)
    const cleanEntries = (cv.entries || [])
      .filter(e => e.category !== 'CONTACT_INFO')
      .map(e => ({
        id: e.id,
        category: e.category,
        title: e.title || '',
        subtitle: e.subtitle || '',
        description: e.description || ''
      }));

    const prompt = `
    Sen deneyimli bir İK uzmanı ve CV danışmanısın. Adayın mevcut CV entry'lerini analiz et ve hedef iş ilanıyla karşılaştırarak somut iyileştirme önerileri sun.

    GÖREV:
    1. İş ilanındaki anahtar kelimeler, gereksinimler ve beklentileri tespit et.
    2. CV'deki hangi entry'lerin ilanla örtüştüğünü veya güçlendirilebileceğini belirle.
    3. Her entry için; ilandaki anahtar kelimeleri doğal şekilde yansıtan, ATS sistemleri için optimize edilmiş yeni açıklamalar yaz.
    4. Genel bir profil özeti öner.

    KRİTİK KURAL: 'entryId' alanına MUTLAKA aşağıdaki CV listesindeki 'id' değerini integer olarak yaz.
    Asla uydurma/random ID kullanma. Listede olmayan bir ID yazma.
    
    Mevcut ATS skoru hakkında: İş ilanıyla örtüşme oranına, anahtar kelime kullanımına ve CV yapısına bakarak 0-100 arası gerçekçi bir skor ver.

    CV Entry Listesi (id değerlerini proposal'larda kullan):
    ${JSON.stringify(cleanEntries, null, 2)}

    İş İlanı:
    """${jobDescription}"""

    İstenen JSON Çıktısı:
    {
      "improvedSummary": "Profil özeti — ilandaki pozisyona yönelik, güçlü ve ATS uyumlu",
      "atsScore": 75,
      "proposals": [
        {
          "entryId": 123,
          "category": "EXPERIENCE | EDUCATION | SKILL | PROJECT | CERTIFICATE | OTHER",
          "suggestedTitle": "Yeni başlık (değiştirilmeyecekse orijinali yaz)",
          "suggestedDescription": "İlandaki anahtar kelimeleri içeren, 3-5 madde halinde güçlendirilmiş açıklama",
          "aiComment": "Bu değişikliği neden önerdiğini kısaca açıkla"
        }
      ]
    }
    `;

    const result = await withRetry(() => model.generateContent(prompt));
    const response = await result.response;
    const parsed = cleanAndParseJSON(response.text());

    // Güvenlik: entryId'leri integer'a çevir ve null olanları çıkar
    if (parsed.proposals) {
      const validIds = new Set(cleanEntries.map(e => e.id));
      parsed.proposals = parsed.proposals
        .map(p => ({ ...p, entryId: parseInt(p.entryId) || null }))
        .filter(p => p.entryId !== null && validIds.has(p.entryId));
    }

    return parsed;
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