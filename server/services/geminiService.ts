import AppError from "../utils/AppError";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const withRetry = async (fn: () => Promise<any>, maxRetries = 3): Promise<any> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const is429 = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Too Many Requests');
      if (is429 && attempt < maxRetries) {
        const waitSec = attempt * 10;
        console.log(`[RETRY] Gemini rate limit asildi, ${waitSec}s beklenip tekrar denenecek (deneme ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
      } else {
        throw error;
      }
    }
  }
};

const cleanAndParseJSON = (jsonString: string): any => {
  try {
    const cleaned = jsonString.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("[ERROR] JSON Parse Hatasi. Ham Metin:", jsonString);
    throw new AppError("Gemini yaniti gecerli bir JSON formatinda degil.", 400);
  }
};

export const parseCVText = async (rawText: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    Aşağıda ham metni verilen CV'yi analiz et ve istenen JSON şemasına tam olarak uygun olacak şekilde ayrıştır.
    Eğer bir bilgi yoksa 'null' bırakabilirsin. Tarihleri (startDate, endDate) anlayabildiğin en iyi formata (örn: YYYY-MM) çevir.
    Eğer tarih yoksa veya "Devam ediyor" ise, uygun şekilde formatla veya endDate'i null bırak.

    ÖNEMLİ KURALLAR:
    - SADECE geçerli bir JSON formatı döndür (Markdown veya ekstra metin kullanma, doğrudan süslü parantez ile başla).
    - CV içerisindeki yetenekleri (Skills), deneyimleri (Experience) ve eğitimleri (Education) "entries" dizisinde topla.
    - Kategori (category) alanı SADECE şunlardan biri olabilir: "EXPERIENCE", "EDUCATION", "SKILL", "PROJECT", "CERTIFICATE", "CONTACT_INFO".
    - Profesyonel özeti veya kişi hakkında genel bilgiyi "summary" alanına yaz.

    Beklenen JSON yapısı:
    {
      "summary": "Kişinin profesyonel özeti, hedefleri veya genel arka planı...",
      "entries": [
        {
          "category": "EXPERIENCE",
          "title": "Software Engineer",
          "subtitle": "Şirket Adı",
          "startDate": "2020-01",
          "endDate": "2023-05",
          "description": "Yaptığı işler, başarıları..."
        },
        {
          "category": "EDUCATION",
          "title": "Lisans Derecesi - Bilgisayar Mühendisliği",
          "subtitle": "Üniversite Adı",
          "startDate": "2015-09",
          "endDate": "2019-06",
          "description": "Not ortalaması, kulüpler vs."
        },
        {
          "category": "SKILL",
          "title": "JavaScript",
          "subtitle": "İleri Seviye",
          "startDate": null,
          "endDate": null,
          "description": null
        }
      ]
    }
    `;

    const result = await withRetry(() => model.generateContent(prompt + `\n\n"""${rawText}"""`));
    const response = await result.response;
    return cleanAndParseJSON(response.text());
  } catch (error) {
    console.error("[ERROR] Gemini Parse Hatasi:", error);
    throw new AppError("CV ayristirilamadi.", 400);
  }
};

export const analyzeATSCompatibility = async (rawText: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Aşağıda ham metni verilen CV'yi ATS (Aday Takip Sistemi) uyumluluğu açısından analiz et.
    Kritik kriterleri (anahtar kelimeler, format, okunabilirlik) değerlendir.
    
    İstenen JSON Formatı: 
    {
      "score": 0-100 arası sayı, 
      "feedback": "Kısa ve yapıcı bir geri bildirim metni"
    }`;

    const result = await withRetry(() => model.generateContent(prompt + `\n\n"""${rawText}"""`));
    const response = await result.response;
    return cleanAndParseJSON(response.text());
  } catch (error) {
    console.error("Gemini ATS Analiz Hatası:", error);
    return { score: 50, feedback: "Analiz sırasında bir hata oluştu." };
  }
};

export const extractJobDetails = async (jobText: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    const prompt = `Aşağıda verilen iş ilanı metnini analiz et ve bilgileri ayrıştır.
    İstenen JSON: {
      "title": "İş Başlığı", 
      "company": "Şirket Adı", 
      "skills": ["beceri1", "beceri2"], 
      "requirements": ["şart1", "şart2"], 
      "description": "Kısa özet"
    }`;
    const result = await withRetry(() => model.generateContent(prompt + `\n\n"""${jobText}"""`));
    const response = await result.response;
    return cleanAndParseJSON(response.text());
  } catch (error) {
    console.error("Gemini İş İlanı Analiz Hatası:", error);
    throw new AppError("İş ilanı analiz edilemedi.", 400);
  }
};

export const generateTailoringProposals = async (cv: any, jobDescription: string) => {
  console.log("[DEBUG] generateTailoringProposals basladi");
  console.log("[DEBUG] CV ID:", cv?.id, "Entries Sayisi:", cv?.entries?.length);
  console.log("[DEBUG] Job Description Uzunlugu:", jobDescription?.length);
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("[CRITICAL] GEMINI_API_KEY TANIMLI DEGIL!");
      throw new AppError("Gemini API anahtarı yapılandırılmamış.", 500);
    }
    
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const cleanEntries = (cv.entries || [])
      .filter((e: any) => e.category !== 'CONTACT_INFO')
      .map((e: any) => ({
        id: e.id, 
        category: e.category, 
        title: e.title || '', 
        subtitle: e.subtitle || '', 
        description: e.description || ''
      }));

    console.log("[DEBUG] Prompt hazirlaniyor. CleanEntries hazirlandi.");
    const prompt = `Sen deneyimli bir İK uzmanısın. Kullanıcının CV'sini hedef iş ilanına göre uyarla.
    
    ÖNEMLİ KURALLAR:
    1. SADECE geçerli bir JSON formatı döndür. Markdown veya ekstra metin (örn: "İşte sonuçlar") ASLA kullanma.
    2. "proposals" dizisindeki "entryId" değerleri, SADECE sana verilen CV Kayıtları içerisindeki "id" değerlerinden biri olmalıdır.
    3. KESİNLİKLE yeni ID uydurma veya mevcut ID'leri değiştirme. Eğer bir kaydı uyduramıyorsan o kaydı proposals dizisine ekleme.
    4. "suggestedTitle" ve "suggestedDescription" alanları profesyonel ve iş ilanına uyumlu olmalıdır.

    CV Kayıtları: ${JSON.stringify(cleanEntries)}
    İş İlanı: """${jobDescription}"""
    
    GÖREV:
    1. Profesyonel özeti (improvedSummary) iş ilanındaki anahtar kelimeleri içerecek şekilde yeniden yaz.
    2. Mevcut CV kayıtlarından iş ilanıyla en alakalı olanları seç ve içeriklerini (suggestedDescription) hedefe yönelik iyileştir.
    3. Başlıkları da (suggestedTitle) gerekiyorsa daha profesyonel hale getir.
    4. Her iyileştirme için neden yapıldığına dair kısa bir not (aiComment) ekle.
    5. Tahmini bir ATS skoru (atsScore) belirle (0-100 arası).

    DÖNÜŞ FORMATI (JSON):
    {
      "improvedSummary": "...",
      "atsScore": 85,
      "proposals": [
        {
          "entryId": number,
          "category": "...",
          "suggestedTitle": "...",
          "suggestedDescription": "...",
          "aiComment": "..."
        }
      ]
    }
    `;

    let rawResponse: string;
    try {
      const result = await withRetry(() => model.generateContent(prompt));
      const response = await result.response;
      rawResponse = response.text();
    } catch (err) {
      console.error('[ERROR] Gemini generateContent failed:', err);
      throw new AppError('Uyarlama önerileri oluşturulamadı: Gemini API hatası.', 400);
    }

    let parsed: any;
    try {
      parsed = cleanAndParseJSON(rawResponse);
    } catch (parseErr) {
      console.error('[ERROR] Gemini response parsing failed. Raw response:', rawResponse);
      return { proposals: [], rawResponse, message: 'Gemini yanıtı geçerli JSON formatında değil.' };
    }

    if (parsed && parsed.proposals && Array.isArray(parsed.proposals)) {
      console.log("[DEBUG] Proposals isleniyor. Gelen adet:", parsed.proposals.length);
      const validIds = new Set(cleanEntries.map((e: any) => e.id));
      
      parsed.proposals = parsed.proposals
        .map((p: any) => ({
          ...p,
          entryId: p.entryId ? parseInt(p.entryId.toString()) : null,
          suggestedTitle: p.suggestedTitle || p.title || '',
          suggestedDescription: p.suggestedDescription || p.content || ''
        }))
        .filter((p: any) => {
          const isValid = p.entryId !== null && validIds.has(p.entryId);
          if (!isValid) console.warn(`[WARN] Gemini uydurma veya gecersiz entryId dondu: ${p.entryId}`);
          return isValid;
        });
      
      console.log("[DEBUG] Filtreleme sonrasi gecerli proposals:", parsed.proposals.length);
    }
    console.log("[DEBUG] Gemini yaniti basariyla alindi ve islendi.");
    return parsed;

  } catch (error: any) {
    console.error("[DEBUG] Gemini Uyarlama Hatası Detayı:", error?.message || error);
    console.error("[DEBUG] Hata Stack:", error?.stack);
    throw new AppError("Uyarlama önerileri oluşturulamadı: " + (error?.message || "Bilinmeyen hata"), 400);
  }
};

export default {
  parseCVText,
  analyzeATSCompatibility,
  extractJobDetails,
  generateTailoringProposals
};
