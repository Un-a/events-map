const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

async function initializeTelegramClient() {
  const apiId = Number(process.env.API_ID);
  const apiHash = process.env.API_HASH;
  const session = new StringSession(process.env.SESSION);

  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  console.log("Подключились!");

  return client;
}

module.exports = { initializeTelegramClient };
