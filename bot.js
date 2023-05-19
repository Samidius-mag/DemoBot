const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

// Токен бота, который мы получили от BotFather
const token = '6237100701:AAFDTCeZw8wWGc6MQw1oBvea6Nk-zKrV3t4';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const userId = msg.from.id;
  const user = getUser(userId);

  if (!user) {
    // Если пользователь не найден, добавляем его в список пользователей
    addUser(userId);
    // Отправляем сообщение с кнопкой "Начать"
    bot.sendMessage(msg.chat.id, 'Нажмите на кнопку "Начать"', {
      reply_markup: {
        keyboard: [[{ text: 'Начать' }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  } else if (user.expired) {
    // Если у пользователя истек демо-период, сообщаем ему об этом
    bot.sendMessage(msg.chat.id, 'Ваш демо-период истек. Для продолжения работы необходимо оплатить подписку.');
  } else {
    // Если пользователь уже зарегистрирован и его демо-период не истек, отправляем ему сообщение с кнопками
    bot.sendMessage(msg.chat.id, 'Выберите действие:', {
      reply_markup: {
        keyboard: [
          [{ text: 'Получить информацию' }],
          [{ text: 'Оплатить подписку' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
});

// Обработчик нажатия на кнопку "Начать"
bot.on('message', (msg) => {
  if (msg.text === 'Начать') {
    const userId = msg.from.id;
    const user = getUser(userId);

    if (user && !user.expired) {
      // Если пользователь уже зарегистрирован и его демо-период не истек, отправляем ему сообщение с кнопками
      bot.sendMessage(msg.chat.id, 'Выберите действие:', {
        reply_markup: {
          keyboard: [
            [{ text: 'Получить информацию' }],
            [{ text: 'Оплатить подписку' }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    }
  }
});

// Обработчик нажатия на кнопку "Получить информацию"
bot.on('message', (msg) => {
  if (msg.text === 'Получить информацию') {
    const userId = msg.from.id;
    const user = getUser(userId);

    if (user && !user.expired) {
      // Если пользователь уже зарегистрирован и его демо-период не истек, отправляем ему информацию
      bot.sendMessage(msg.chat.id, `Информация для пользователя ${userId}`);
    }
  }
});

// Обработчик нажатия на кнопку "Оплатить подписку"
bot.on('message', (msg) => {
  if (msg.text === 'Оплатить подписку') {
    const userId = msg.from.id;
    const user = getUser(userId);

    if (user && !user.expired) {
      // Если пользователь уже зарегистрирован и его демо-период не истек, сообщаем ему о необходимости оплаты подписки
      bot.sendMessage(msg.chat.id, 'Для продолжения работы необходимо оплатить подписку.');
    }
  }
});

// Функция для получения данных о пользователе по его идентификатору
function getUser(userId) {
  const users = getUsers();
  return users.find((user) => user.id === userId);
}

// Функция для добавления нового пользователя
function addUser(userId) {
  const users = getUsers();
  users.push({ id: userId, expired: false });
  saveUsers(users);
}

// Функция для получения списка пользователей из файла users.json
function getUsers() {
  const data = fs.readFileSync('users.json');
  return JSON.parse(data).users;
}

// Функция для сохранения списка пользователей в файл users.json
function saveUsers(users) {
  const data = JSON.stringify({ users });
  fs.writeFileSync('users.json', data);
}
