require("dotenv").config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) =>
  new Promise((resolve) => rl.question(text, resolve));

(async () => {
  const client = new TelegramClient(
    new StringSession(""),
    Number(process.env.API_ID),
    process.env.API_HASH,
    { connectionRetries: 5 }
  );

  await client.start({
    phoneNumber: async () => await question("Номер телефона: "),
    password: async () => await question("Пароль (если есть): "),
    phoneCode: async () => await question("Код из Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("Новая сессия:", client.session.save());
  rl.close();
  await client.disconnect();
})();