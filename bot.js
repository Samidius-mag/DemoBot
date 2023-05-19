const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = '6237100701:AAFDTCeZw8wWGc6MQw1oBvea6Nk-zKrV3t4';
const bot = new TelegramBot(token, { polling: true });

const usersFile = 'users.json';

// Функция для проверки, есть ли пользователь в файле
function isUserExist(userId) {
  const users = JSON.parse(fs.readFileSync(usersFile));
  return users.hasOwnProperty(userId);
}

// Функция для получения информации о пользователе
function getUserInfo(userId) {
  const users = JSON.parse(fs.readFileSync(usersFile));
  return users[userId];
}

// Функция для обновления информации о пользователе
function updateUserInfo(userId, userInfo) {
  const users = JSON.parse(fs.readFileSync(usersFile));
  users[userId] = userInfo;
  fs.writeFileSync(usersFile, JSON.stringify(users));
}

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const userId = msg.chat.id;
  const userInfo = {
    demo: true,
    demoExpires: Date.now() + 24 * 60 * 60 * 1000, // Демо доступ на 24 часа
    subscribed: false,
  };
  updateUserInfo(userId, userInfo);
  bot.sendMessage(userId, 'Добро пожаловать в личный кабинет!');
});

// Обработчик команды /status
bot.onText(/\/status/, (msg) => {
  const userId = msg.chat.id;
  if (!isUserExist(userId)) {
    bot.sendMessage(userId, 'Вы не зарегистрированы в системе');
    return;
  }
  const userInfo = getUserInfo(userId);
  if (userInfo.demo) {
    bot.sendMessage(userId, `Демо доступ до ${new Date(userInfo.demoExpires).toLocaleString()}`);
  } else if (userInfo.subscribed) {
    bot.sendMessage(userId, 'Вы подписаны на месячную подписку');
  } else {
    bot.sendMessage(userId, 'Ваш доступ истек');
  }
});

// Обработчик команды /subscribe
bot.onText(/\/subscribe/, (msg) => {
  const userId = msg.chat.id;
  if (!isUserExist(userId)) {
    bot.sendMessage(userId, 'Вы не зарегистрированы в системе');
    return;
  }
  const userInfo = getUserInfo(userId);
  if (userInfo.demo && Date.now() < userInfo.demoExpires) {
    userInfo.demo = false;
    userInfo.subscribed = true;
    updateUserInfo(userId, userInfo);
    bot.sendMessage(userId, 'Вы успешно подписались на месячную подписку');
  } else {
    bot.sendMessage(userId, 'Ваш доступ истек или вы уже подписаны');
  }
});

// Обработчик неизвестной команды
bot.on('message', (msg) => {
  const userId = msg.chat.id;
  bot.sendMessage(userId, 'Неизвестная команда');
});
