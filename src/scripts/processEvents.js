const { extractLocation } = require("./extractLocation");
const { geocode } = require("./geocode");
const { getWeekendDates } = require("./getWeekendDates");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function processEvents(client, events) {
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
      const dates = getWeekendDates(
        process.env.OVERRIDE_SATURDAY || null,
        process.env.OVERRIDE_SUNDAY || null
      );
      const dateForDay = event.day === 'saturday' ? dates.saturday : dates.sunday;

      locations = await extractLocation(post.message, event.name, event.day, dateForDay);
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

  return result;
}

module.exports = { processEvents };
