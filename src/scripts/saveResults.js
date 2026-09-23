const fs = require("fs");
const { getUnresolvedAddresses } = require("./geocode");

function saveResults(result, dates) {
  const unresolved = getUnresolvedAddresses();
  if (unresolved.length > 0) {
    console.log("⚠️ Не найдены координаты для:");
    unresolved.forEach(addr => console.log("  -", addr));
  }

  const output = {
    dates,
    events: result
  };

  fs.writeFileSync(
    "docs/events.json",
    JSON.stringify(output, null, 2),
    "utf-8"
  );

  console.log("docs/events.json сохранён!");
}

module.exports = { saveResults };
