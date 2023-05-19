const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const bot = new TelegramBot('6237100701:AAFDTCeZw8wWGc6MQw1oBvea6Nk-zKrV3t4', { polling: true });
const usersFile = 'users.json';

// Функция для чтения данных о пользователях из файла
function readUsers() {
  const data = fs.readFileSync(usersFile);
  return JSON.parse(data);
}

// Функция для записи данных о пользователях в файл
function writeUsers(users) {
  const data = JSON.stringify(users);
  fs.writeFileSync(usersFile, data);
}

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const users = readUsers();
  const user = users[chatId];

  if (!user) {
    // Если пользователь не найден, создаем нового
    users[chatId] = {
      demo: true,
      demoExpires: Date.now() + 24 * 60 * 60 * 1000, // демо версия на 24 часа
      subscribed: false,
    };
    writeUsers(users);
    bot.sendMessage(chatId, 'Добро пожаловать! Вы получили демо версию бота на 24 часа.');
  } else if (user.subscribed) {
    // Если пользователь подписан, показываем личный кабинет
    bot.sendMessage(chatId, 'Вы уже подписаны на месячную подписку.');
    showAccount(chatId, user);
  } else if (user.demo) {
    // Если пользователь находится в демо-режиме, показываем оставшееся время
    const remainingTime = Math.ceil((user.demoExpires - Date.now()) / (60 * 60 * 1000));
    bot.sendMessage(chatId, `У вас осталось ${remainingTime} часов демо-версии.`);
  } else {
    // Если демо-версия истекла, предлагаем подписаться
    bot.sendMessage(chatId, 'Демо-версия истекла. Хотите подписаться на месячную подписку?');
    showSubscription(chatId);
  }
});

// Функция для показа личного кабинета
function showAccount(chatId, user) {
  bot.sendMessage(chatId, `Личный кабинет\n\nПодписка: ${user.subscribed ? 'активна' : 'не активна'}`);
}

// Функция для показа опции подписки
function showSubscription(chatId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: 'Подписаться', callback_data: 'subscribe' },
        { text: 'Отмена', callback_data: 'cancel' },
      ],
    ],
  };
  bot.sendMessage(chatId, 'Хотите подписаться на месячную подписку?', { reply_markup: keyboard });
}

// Обработчик нажатия на кнопку
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const users = readUsers();
  const user = users[chatId];

  if (query.data === 'subscribe') {
    // Если пользователь нажал на кнопку "Подписаться"
    user.subscribed = true;
    writeUsers(users);
    bot.sendMessage(chatId, 'Вы успешно подписались на месячную подписку.');
    showAccount(chatId, user);
  } else if (query.data === 'cancel') {
    // Если пользователь нажал на кнопку "Отмена"
    bot.sendMessage(chatId, 'Вы отменили подписку.');
  }
});
