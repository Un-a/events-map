const DAY_PATTERNS = {
  saturday: /^суббота\s*:/im,
  sunday: /^воскресенье\s*:/im
};

function findDayIndices(text) {
  return {
    saturday: text.search(DAY_PATTERNS.saturday),
    sunday: text.search(DAY_PATTERNS.sunday)
  };
}

async function fetchWeekendPost(client) {
  const messages = await client.getMessages("mamakudaidem", { limit: 30 });

  const weekendPost = messages.find((msg) => isRealWeekendPost(msg));

  if (!weekendPost) {
    throw new Error("Пост не найден — попробуй увеличить limit");
  }

  return weekendPost;
}

function isRealWeekendPost(msg) {
  if (!msg.message || !/(анонс|афиша) на (эти )?выходные/i.test(msg.message)) {
    return false;
  }

  const { saturday, sunday } = findDayIndices(msg.message);

  const linkCount = (msg.entities || []).filter(
    (e) => e.className === "MessageEntityTextUrl"
  ).length;

  return saturday !== -1 && sunday !== -1 && linkCount >= 2;
}

function parseEvents(weekendPost) {
  const text = weekendPost.message;
  const entities = weekendPost.entities || [];

  const { sunday: sundayIndex } = findDayIndices(text);

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