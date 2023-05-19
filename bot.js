const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Токен бота, полученный от BotFather
const token = '6237100701:AAFDTCeZw8wWGc6MQw1oBvea6Nk-zKrV3t4';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username;

  // Добавляем пользователя в файл users.json
  const user = { id: chatId, username: username };
  const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  users.push(user);
  fs.writeFileSync('users.json', JSON.stringify(users));

  // Отправляем сообщение пользователю
  bot.sendMessage(chatId, 'Вы были добавлены в список пользователей.');
});
