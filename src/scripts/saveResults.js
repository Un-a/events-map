const fs = require("fs");
const { getUnresolvedAddresses } = require("./geocode");

function saveResults(result) {
  const unresolved = getUnresolvedAddresses();
  if (unresolved.length > 0) {
    console.log("⚠️ Не найдены координаты для:");
    unresolved.forEach(addr => console.log("  -", addr));
  }

  fs.writeFileSync(
    "public/events.json",
    JSON.stringify(result, null, 2),
    "utf-8"
  );

  console.log("public/events.json сохранён!");
}

module.exports = { saveResults };
