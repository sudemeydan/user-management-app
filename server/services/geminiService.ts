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
        console.log(`Gemini rate limit aşıldı, ${waitSec}s beklenip tekrar denenecek (deneme ${attempt}/${maxRetries})...`);
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
    console.error("JSON Parse Hatası. Ham Metin:", jsonString);
    throw new AppError("Gemini yanıtı geçerli bir JSON formatında değil.", 400);
  }
};

export const parseCVText = async (rawText: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    Aşağıda ham metni verilen CV'yi analiz et ve istenen JSON şemasına uygun olarak ayrıştır.
    Eğer bir bilgi yoksa null veya boş bırakabilirsin. Tarihleri (startDate, endDate) anlayabildiğin en iyi formata (örn: YYYY-MM) çevir.
    
    ÖNEMLİ KURALLAR:
    ...
    `;

    const result = await withRetry(() => model.generateContent(prompt + `\n\n"""${rawText}"""`));
    const response = await result.response;
    return cleanAndParseJSON(response.text());
  } catch (error) {
    console.error("Gemini Parse Hatası:", error);
    throw new AppError("CV ayrıştırılamadı.", 400);
  }
};

export const analyzeATSCompatibility = async (rawText: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Aşağıda ham metni verilen CV'yi ATS uyumluluğu açısından analiz et.
    İstenen JSON Formatı: {"score": 0, "feedback": "string"}`;

    const result = await withRetry(() => model.generateContent(prompt + `\n\n"""${rawText}"""`));
    const response = await result.response;
    return cleanAndParseJSON(response.text());
  } catch (error) {
    return { score: 50, feedback: "Analiz sırasında bir hata oluştu." };
  }
};

export const extractJobDetails = async (jobText: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    const prompt = `Aşağıda verilen iş ilanı metnini analiz et. İstenen JSON: {"title": "", "company":"", "skills": [], "requirements": [], "summary": ""}`;
    const result = await withRetry(() => model.generateContent(prompt + `\n\n"""${jobText}"""`));
    const response = await result.response;
    return cleanAndParseJSON(response.text());
  } catch (error) {
    throw new AppError("İş ilanı analiz edilemedi.", 400);
  }
};

export const generateTailoringProposals = async (cv: any, jobDescription: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const cleanEntries = (cv.entries || [])
      .filter((e: any) => e.category !== 'CONTACT_INFO')
      .map((e: any) => ({
        id: e.id, category: e.category, title: e.title || '', subtitle: e.subtitle || '', description: e.description || ''
      }));

    const prompt = `Sen deneyimli bir İK uzmanı ve CV danışmanısın.
    CV Entry Listesi: ${JSON.stringify(cleanEntries)}
    İş İlanı: """${jobDescription}"""
    `;

    const result = await withRetry(() => model.generateContent(prompt));
    const response = await result.response;
    const parsed = cleanAndParseJSON(response.text());
    
    if (parsed.proposals) {
      const validIds = new Set(cleanEntries.map((e: any) => e.id));
      parsed.proposals = parsed.proposals
        .map((p: any) => ({ ...p, entryId: parseInt(p.entryId) || null }))
        .filter((p: any) => p.entryId !== null && validIds.has(p.entryId));
    }
    return parsed;
  } catch (error) {
    throw new AppError("Uyarlama önerileri oluşturulamadı.", 400);
  }
};

export default {
  parseCVText,
  analyzeATSCompatibility,
  extractJobDetails,
  generateTailoringProposals
};
