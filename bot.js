const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = '6237100701:AAFDTCeZw8wWGc6MQw1oBvea6Nk-zKrV3t4';
const bot = new TelegramBot(token, { polling: true });

const usersFile = 'users.json';

// Функция для чтения файла с пользователями
function readUsersFile() {
  const usersData = fs.readFileSync(usersFile);
  return JSON.parse(usersData);
}

// Функция для записи файла с пользователями
function writeUsersFile(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users));
}

// Функция для проверки, есть ли пользователь в файле
function isUserExist(userId) {
  const users = readUsersFile();
  return users.hasOwnProperty(userId);
}

// Функция для получения информации о пользователе
function getUserInfo(userId) {
  const users = readUsersFile();
  return users[userId];
}

// Функция для обновления информации о пользователе
function updateUserInfo(userId, userInfo) {
  const users = readUsersFile();
  users[userId] = userInfo;
  writeUsersFile(users);
}

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const userId = msg.chat.id;
  const now = new Date().getTime();
  const demoPeriod = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

  if (!isUserExist(userId)) {
    // Если пользователь новый, добавляем его в файл
    const userInfo = {
      demoExpiresAt: now + demoPeriod,
      isSubscribed: false,
    };
    updateUserInfo(userId, userInfo);
    bot.sendMessage(userId, 'Добро пожаловать! Вы получили демо-версию бота на 24 часа.');
  } else {
    // Если пользователь уже есть в файле, проверяем, истек ли у него демо-период
    const userInfo = getUserInfo(userId);
    if (userInfo.demoExpiresAt > now) {
      bot.sendMessage(userId, 'Ваша демо-версия еще не истекла.');
    } else if (userInfo.isSubscribed) {
      bot.sendMessage(userId, 'Вы уже подписаны на бота.');
    } else {
      bot.sendMessage(userId, 'Ваша демо-версия истекла. Хотите подписаться на бота?');
    }
  }
});

// Обработчик команды /subscribe
bot.onText(/\/subscribe/, (msg) => {
  const userId = msg.chat.id;
  const userInfo = getUserInfo(userId);
  if (userInfo.isSubscribed) {
    bot.sendMessage(userId, 'Вы уже подписаны на бота.');
  } else {
    userInfo.isSubscribed = true;
    updateUserInfo(userId, userInfo);
    bot.sendMessage(userId, 'Спасибо за подписку!');
  }
});
