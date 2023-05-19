const fs = require('fs');
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
    // Проверяем, есть ли пользователь в файле users.json
    const users = JSON.parse(fs.readFileSync('users.json'));
    const user = users.find(u => u.id === msg.from.id);
    if (!user) {
      // Если пользователь не найден, добавляем его в файл
      users.push({
        id: msg.from.id,
        demoMode: true,
        subscription: false,
        subscriptionExpires: null,
      });
      fs.writeFileSync('users.json', JSON.stringify(users));
    } else if (user.subscription && new Date(user.subscriptionExpires) < new Date()) {
      // Если у пользователя есть подписка, но она истекла, переводим его в демо-режим
      user.demoMode = true;
      user.subscription = false;
      user.subscriptionExpires = null;
      fs.writeFileSync('users.json', JSON.stringify(users));
    } else if (user.demoMode && new Date() - new Date(user.demoMode) > 24 * 60 * 60 * 1000) {
      // Если у пользователя демо-режим и он истек, удаляем его из файла
      users.splice(users.indexOf(user), 1);
      fs.writeFileSync('users.json', JSON.stringify(users));
      bot.sendMessage(msg.chat.id, 'Демо-режим закончился. Купите подписку, чтобы продолжить использование личного кабинета.');
      return;
    }
    // Выводим в консоль идентификатор пользователя
    console.log(`User ID: ${msg.from.id}`);
    // Отправляем сообщение с доступными функциями
    bot.sendMessage(msg.chat.id, 'Выберите действие:', {
      reply_markup: {
        keyboard: [
          [{ text: 'Получить информацию' }],
          [{ text: 'Купить подписку' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
});

// Обработчик команды "Получить информацию"
bot.onText(/Получить информацию/, (msg) => {
  // Проверяем, есть ли пользователь в файле users.json
  const users = JSON.parse(fs.readFileSync('users.json'));
  const user = users.find(u => u.id === msg.from.id);
  if (!user) {
    bot.sendMessage(msg.chat.id, 'Вы не зарегистрированы в личном кабинете. Нажмите /start, чтобы зарегистрироваться.');
  } else if (user.demoMode) {
    bot.sendMessage(msg.chat.id, 'Вы находитесь в демо-режиме. Купите подписку, чтобы получить доступ к информации.');
  } else {
    bot.sendMessage(msg.chat.id, 'Информация о вашей подписке:');
    bot.sendMessage(msg.chat.id, `Подписка активна до ${user.subscriptionExpires}`);
  }
});

// Обработчик команды "Купить подписку"
bot.onText(/Купить подписку/, (msg) => {
  // Проверяем, есть ли пользователь в файле users.json
  const users = JSON.parse(fs.readFileSync('users.json'));
  const user = users.find(u => u.id === msg.from.id);
  if (!user) {
    bot.sendMessage(msg.chat.id, 'Вы не зарегистрированы в личном кабинете. Нажмите /start, чтобы зарегистрироваться.');
  } else if (user.subscription && new Date(user.subscriptionExpires) >= new Date()) {
    bot.sendMessage(msg.chat.id, 'У вас уже есть активная подписка.');
  } else {
    // Устанавливаем подписку на месяц
    user.demoMode = false;
    user.subscription = true;
    user.subscriptionExpires = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
    fs.writeFileSync('users.json', JSON.stringify(users));
    bot.sendMessage(msg.chat.id, 'Подписка успешно куплена.');
  }
});
