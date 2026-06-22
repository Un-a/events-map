require("dotenv").config();

const { initializeTelegramClient } = require("./scripts/telegramClient");
const { fetchWeekendPost, parseEvents } = require("./scripts/fetchWeekendPost");
const { processEvents } = require("./scripts/processEvents");
const { saveResults } = require("./scripts/saveResults");

(async () => {
  try {
    const client = await initializeTelegramClient();

    const weekendPost = await fetchWeekendPost(client);
    const events = parseEvents(weekendPost);

    const result = await processEvents(client, events);

    saveResults(result);

    await client.disconnect();
  } catch (error) {
    console.error("Ошибка:", error.message);
    process.exit(1);
  }
})();