const TelegramBot = require('node-telegram-bot-api');

// Токен бота, который мы получили от BotFather
const token = '6237100701:AAFDTCeZw8wWGc6MQw1oBvea6Nk-zKrV3t4';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  // Отправляем сообщение с кнопкой "Начать"
  bot.sendMessage(msg.chat.id, 'Нажмите на кнопку "Начать"', {
    reply_markup: {
      keyboard: [[{ text: 'Начать' }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

// Обработчик нажатия на кнопку "Начать"
bot.on('message', (msg) => {
  if (msg.text === 'Начать') {
    // Выводим в консоль идентификатор пользователя
    console.log(`User ID: ${msg.from.id}`);
  }
});
