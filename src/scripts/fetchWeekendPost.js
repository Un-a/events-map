async function fetchWeekendPost(client) {
  const messages = await client.getMessages("mamakudaidem", { limit: 0 });

 const weekendPost = messages.find((msg) =>
  msg.message && /анонс на (эти )?выходные/i.test(msg.message)
);

  if (!weekendPost) {
    throw new Error("Пост не найден — попробуй увеличить limit");
  }

  return weekendPost;
}

function parseEvents(weekendPost) {
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

  return events;
}

module.exports = { fetchWeekendPost, parseEvents };
