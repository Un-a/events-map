require("dotenv").config();
const { extractLocation } = require("./extractLocation");
const { initializeTelegramClient } = require("./telegramClient");
const { getWeekendDates } = require("./getWeekendDates");

const postUrl = "https://t.me/mamakudaidem/1647";

(async () => {
  const client = await initializeTelegramClient();
  
  const postId = parseInt(postUrl.split("/").pop());
  const [post] = await client.getMessages("mamakudaidem", { ids: postId });
  
  console.log("Текст поста:", post.message);

  const dates = getWeekendDates(
      process.env.OVERRIDE_SATURDAY || null,
      process.env.OVERRIDE_SUNDAY || null
    );
  const result = await extractLocation(post.message, "тест", "saturday", dates.saturday);
  console.log("Результат:", result);
  
  await client.disconnect();
})();