# 🗺️ Belgrade Family Events Map

Интерактивная карта детский мероприятий Белграда на выходные.  
Данные парсятся из Telegram канала [@mamakudaidem](https://t.me/mamakudaidem).

## Demo
👉 [un-a.github.io/events-map](https://un-a.github.io/events-map/)

## Возможности
- Маркеры мероприятий на карте с попапами — ссылка на пост в Telegram и на Google Maps
- Фильтрация по дням: Суббота / Воскресенье / Все
- Данные обновляются автоматически каждую пятницу через GitHub Actions

## Как это работает
1. Node.js скрипт читает последний пост выходного дня из Telegram канала (MTProto API)
2. Google Gemini извлекает названия мест из текста анонса
3. Nominatim (OpenStreetMap) геокодирует адреса
4. Результат сохраняется в `events.json` и отображается на карте

## Стек
- **Backend:** Node.js, gramjs (Telegram MTProto), Google Gemini API, Nominatim
- **Frontend:** Leaflet.js, OpenStreetMap
- **Инфраструктура:** GitHub Actions, GitHub Pages