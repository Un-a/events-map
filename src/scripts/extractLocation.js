const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-3.1-flash-lite";
const MAX_ATTEMPTS = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildPrompt(text, eventName) {
  return `Ты — гео-ассистент. Из текста анонса мероприятия вытащи место проведения.
Контекст: мероприятия в Белграде или Сербии.
Верни ТОЛЬКО JSON массив строк, без пояснений и без markdown.

Правила:
- Бери место ТОЛЬКО из текста анонса или названия мероприятия. Не подставляй другие места и не заменяй названное место похожим.
- Название переведи в латиницу (сербскую) по написанию из текста: «Театр «Змай»» -> "Pozorište Zmaj".
- Если указан адрес (📍, отдельная строка, скобки), используй его.
- Если указан только город или район, добавь его.
- Если город не указан, добавляй "Beograd".
- Если мест несколько, верни все основные.
- Если место не названо или ты не уверен, верни [].
- Лучше вернуть название как в тексте, чем угадать другое место.

Название: ${eventName}
Текст: ${text}

Примеры:
- Текст: "Место: Театр «Змай»" -> ["Pozorište Zmaj, Beograd"]
- Текст: "📍 Kalemegdan" -> ["Kalemegdan, Beograd"]
- Текст: "Kalemegdan и Ташмайдан" -> ["Kalemegdan, Beograd", "Tasmajdan park, Beograd"]
- Текст: "Онлайн-встреча" -> []`;
}

async function askGemini(prompt) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
  });
  return response.text;
}

function parseLocations(rawText) {
  try {
    const parsed = JSON.parse(rawText);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function extractLocation(text, eventName) {
  if (!text) return [];

  const prompt = buildPrompt(text, eventName);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return parseLocations(await askGemini(prompt));
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        console.error(`❌ Не удалось получить адрес для "${eventName}" после ${MAX_ATTEMPTS} попыток: ${error.message}`);
        return [];
      }
      const delay = attempt * 5000;
      console.warn(`⏳ [Попытка ${attempt}/${MAX_ATTEMPTS}] ${error.message}. Повтор через ${delay / 1000} сек...`);
      await sleep(delay);
    }
  }
}

module.exports = { extractLocation };