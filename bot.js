const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = '6237100701:AAFDTCeZw8wWGc6MQw1oBvea6Nk-zKrV3t4';
const bot = new TelegramBot(token, { polling: true });

// Загрузить данные о пользователях из файла
let users = [];
if (fs.existsSync('users.json')) {
  const data = fs.readFileSync('users.json', 'utf8');
  users = JSON.parse(data);
}

// Обработчик команды "start"
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Проверяем, есть ли пользователь в списке
  const user = users.find((u) => u.id === userId);
  if (user) {
    // Если пользователь уже есть в списке, выводим его данные
    const message = `Привет, ${user.name}! Ваша подписка действительна до ${user.expireDate}.`;
    bot.sendMessage(chatId, message);
  } else {
    // Если пользователь не найден, добавляем его в список и устанавливаем дату истечения подписки на 24 часа
    const now = new Date();
    const expireDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Дата истечения подписки через 24 часа
    const newUser = { id: userId, name: msg.from.username, expireDate };
    users.push(newUser);
    fs.writeFileSync('users.json', JSON.stringify(users)); // Сохраняем данные в файл
    bot.sendMessage(chatId, 'Добро пожаловать в наш бот! Ваша демо-подписка действительна 24 часа.');
  }
});

// Запустить функцию проверки даты истечения подписки каждую минуту
setInterval(() => {
  const now = new Date();
  users.forEach((user, index) => {
    if (user.expireDate <= now) {
      users.splice(index, 1); // Удаляем пользователя из списка при истечении срока действия подписки
      fs.writeFileSync('users.json', JSON.stringify(users)); // Сохраняем данные в файл
    }
  });
}, 60000);
