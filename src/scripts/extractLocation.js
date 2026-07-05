const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function extractLocation(text, eventName, day) {
  if (!text) return null;

const dayInstruction = day ? `
Мероприятие добавлено в список дня: ${day === 'saturday' ? 'суббота' : 'воскресенье'}.
Если в тексте есть явное деление по дням (через дату, "суббота"/"воскресенье", или 📍 с датой) —
верни только места для указанного дня.
Если деления по дням нет — верни все основные места проведения.
Бери только основные точки (отмеченные 📍 или явным адресом), игнорируй места, 
упомянутые вскользь внутри программы (например, "наблюдение с террасы X").` : '';

const prompt = `Ты — гео-ассистент. Из текста анонса мероприятия вытащи адрес или название места.
Контекст: мероприятия в Белграде или Сербии.
Верни ТОЛЬКО JSON массив с адресами, без пояснений и без markdown.
ВАЖНО: название места и город всегда пиши на латинице (сербской или английской).
Если в тексте название дано на кириллице — переведи в официальное латинское написание этого места, которое реально используется (например, в Google Maps или на сайте этого места), а не делай побуквенную транслитерацию.
Если не уверен в точном официальном названии — верни более общее, узнаваемое название места (например, тип учреждения + ближайший заметный ориентир), а не придумывай вариант названия.
Например, "Центр культуры" - "Centar za kulturu".
Если место не в Белграде - добавь город на латинице.
Если мест несколько - верни все.
Если адрес не найден - верни пустой массив [].
${dayInstruction}
Примеры ответов:
- ["Kalemegdan, Beograd"]
- ["Kalemegdan, Beograd", "Tasmajdan park, Beograd"]
- []

Название: ${eventName} 
Текст: ${text}`;

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