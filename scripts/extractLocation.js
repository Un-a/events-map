const { GoogleGenAI } = require("@google/genai");

// Инициализируем клиент. Ключ API подтягивается автоматически из process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function extractLocation(text, eventName) {
  if (!text) return null;

const prompt = `Ты — гео-ассистент. Из текста анонса мероприятия вытащи адрес или название места.
Контекст: мероприятия в Белграде или Сербии.
Верни ТОЛЬКО JSON массив с адресами, без пояснений и без markdown.
ВАЖНО: название места и город всегда пиши на латинице (сербской или английской).
Если место не в Белграде - добавь город на латинице.
Если мест несколько - верни все.
Если адрес не найден - верни пустой массив [].

Примеры ответов:
- ["Kalemegdan, Beograd"]
- ["Kalemegdan, Beograd", "Tasmajdan park, Beograd"]
- []

Название: ${eventName} 
Текст: ${text}`;

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Новый синтаксис вызова генерации контента
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });
      const responseText = response.text ? response.text.trim() : "null";

        try {
            const parsed = JSON.parse(responseText);
            return Array.isArray(parsed) ?parsed : [];
        } catch {
            return [];
        }

    } catch (error) {
      // Проверяем, является ли ошибка временным сбоем сети или перегрузкой сервера (503/429)
      const isTransient = error.status === 503 || error.status === 429 || error.message?.includes('503');

      if (attempt < maxAttempts) {
        // Прогрессивное увеличение ожидания: 5 секунд на первой ошибке, 10 секунд на второй
        const delay = attempt * 5000; 
        const reason = isTransient ? "Сервер Gemini перегружен (503)" : "Ошибка запроса";
        
        console.warn(`⏳ [Попытка ${attempt}/${maxAttempts}] ${reason}. Повтор через ${delay / 1000} сек...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(`❌ Не удалось получить адрес для мероприятия "${eventName}" после ${maxAttempts} попыток. Ошибка: ${error.message}`);
        return [];
      }
    }
  }
}

module.exports = { extractLocation };