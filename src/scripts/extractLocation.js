const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function extractLocation(text, eventName, day, date = null) {
  if (!text) return null;

const dayLabel = day === 'saturday' ? 'суббота' : 'воскресенье';

const prompt = `Ты — гео-ассистент. Из текста анонса мероприятия вытащи адрес или название места.
Контекст: мероприятия в Белграде или Сербии.
Верни ТОЛЬКО JSON массив с адресами, без пояснений и без markdown.
Название места и город всегда пиши на латинице (сербской или английской).
Используй официальное название места из Google Maps, не транслитерацию.

Правила определения места:
- Адрес может быть явным (📍, отдельная строка) или в скобках внутри текста
- Описание места ("большая площадь в Земуне") — определи официальное название
- Упоминание учреждения ("В Музее науки и техники") — используй как место
- Если текст короткий — определи место из названия мероприятия: "${eventName}"
- Если название указывает на конкретное место — верни только его

Если место не в Белграде - добавь город.
Если мест несколько - верни все основные.
Если место не определить - верни [].

Название: ${eventName} 
Текст: ${text}

Примеры:
- ["Kalemegdan, Beograd"]
- ["Kalemegdan, Beograd", "Tasmajdan park, Beograd"]
- []`;

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          temperature: 0
        }
      });
      const responseText = response.text ? response.text.trim() : "null";
        try {
            const parsed = JSON.parse(responseText);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }

    } catch (error) {
      const isTransient = error.status === 503 || error.status === 429 || error.message?.includes('503');

      if (attempt < maxAttempts) {
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