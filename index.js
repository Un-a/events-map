require("dotenv").config();
require("fs");
const { extractLocation } = require("./scripts/extractLocation");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { geocode, getUnresolvedAddresses } = require("./scripts/geocode");

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const session = new StringSession(process.env.SESSION);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  console.log("Подключились!");

  const messages = await client.getMessages("mamakudaidem", { limit: 50 });

  const weekendPost = messages.find((msg) =>
    msg.message && msg.message.toLowerCase().includes("анонс на выходные")
  );

  if (!weekendPost) {
    console.log("Пост не найден — попробуй увеличить limit");
    await client.disconnect();
    return;
  }

  const text = weekendPost.message;
  const entities = weekendPost.entities || [];

  const saturdayIndex = text.toLowerCase().indexOf("суббота");
  const sundayIndex = text.toLowerCase().indexOf("воскресенье");

  const events = entities
    .filter((e) => e.className === "MessageEntityTextUrl")
    .map((e) => {
      const name = text.slice(e.offset, e.offset + e.length);
      const day = e.offset > sundayIndex ? "sunday" : "saturday";
      return { name, url: e.url, day };
    });

  const cache = {};

  const result = [];

  for (const event of events) {
    const postId = parseInt(event.url.split("/").pop());

    let locations;
    let coordsArray;

    if (cache[postId] !== undefined) {
      locations = cache[postId].locations;
      coordsArray = cache[postId].coordsArray;
    } else {
      const [post] = await client.getMessages("mamakudaidem", { ids: postId });
      locations = await extractLocation(post.message, event.name);
      if (!Array.isArray(locations)) locations = [];

      coordsArray = [];
      for (const loc of locations) {
        const coords = await geocode(loc);
        if (coords) coordsArray.push({ address: loc, ...coords });
        await sleep(1000);
      }

      cache[postId] = { locations, coordsArray };
      await sleep(10000);
    }

    result.push({
      name: event.name,
      day: event.day,
      url: event.url,
      coords: coordsArray,
    });
  }

  const unresolved = getUnresolvedAddresses();
  if (unresolved.length > 0) {
    console.log("⚠️ Не найдены координаты для:");
    unresolved.forEach(addr => console.log("  -", addr));
  }

  const fs = require("fs");

  fs.writeFileSync(
    "events.json",
    JSON.stringify(result, null, 2),
    "utf-8"
  );

  console.log("events.json сохранён!");
  await client.disconnect();
})();