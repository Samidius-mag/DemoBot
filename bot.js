const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Токен бота, который вы получили у BotFather
const token = '6237100701:AAFDTCeZw8wWGc6MQw1oBvea6Nk-zKrV3t4';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Сохраняем ид пользователя в файл users.json
  fs.readFile('users.json', (err, data) => {
    let users = [];

    if (!err) {
      users = JSON.parse(data);
    }

    users.push(chatId);

    fs.writeFile('users.json', JSON.stringify(users), (err) => {
      if (err) {
        console.error(err);
        bot.sendMessage(chatId, 'Произошла ошибка при сохранении ид пользователя');
      } else {
        bot.sendMessage(chatId, 'Ваш ид успешно сохранен');
      }
    });
  });
});

// Запускаем бота
bot.on('polling_error', (error) => {
  console.error(error);
});

console.log('Бот запущен');
