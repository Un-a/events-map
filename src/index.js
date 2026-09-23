require("dotenv").config();

const { initializeTelegramClient } = require("./scripts/telegramClient");
const { fetchWeekendPost, parseEvents } = require("./scripts/fetchWeekendPost");
const { processEvents } = require("./scripts/processEvents");
const { saveResults } = require("./scripts/saveResults");
const { getWeekendDates } = require("./scripts/getWeekendDates");

(async () => {
  try {
    const client = await initializeTelegramClient();

    const weekendPost = await fetchWeekendPost(client);
    const events = parseEvents(weekendPost);

    const result = await processEvents(client, events);

    const dates = getWeekendDates(
      process.env.OVERRIDE_SATURDAY || null,
      process.env.OVERRIDE_SUNDAY || null
    );

    saveResults(result, dates);

    await client.disconnect();
  } catch (error) {
    console.error("Ошибка:", error.message);
    process.exit(1);
  }
})();