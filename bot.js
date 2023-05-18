const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql');

// Подключение к базе данных
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Asetabalana14$',
  database: 'users'
});

// Создание бота
const bot = new TelegramBot('6237100701:AAFDTCeZw8wWGc6MQw1oBvea6Nk-zKrV3t4', { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Проверка наличия пользователя в базе данных
  connection.query(`SELECT * FROM users WHERE chat_id = ${chatId}`, (error, results, fields) => {
    if (error) throw error;

    if (results.length === 0) {
      // Добавление нового пользователя в базу данных
      connection.query(`INSERT INTO users (chat_id, demo_period) VALUES (${chatId}, NOW() + INTERVAL 1 DAY)`, (error, results, fields) => {
        if (error) throw error;

        bot.sendMessage(chatId, 'Добро пожаловать! Вы получили демо-версию бота на 24 часа.');
      });
    } else {
      const demoPeriod = results[0].demo_period;

      if (demoPeriod < new Date()) {
        // Удаление пользователя из базы данных
        connection.query(`DELETE FROM users WHERE chat_id = ${chatId}`, (error, results, fields) => {
          if (error) throw error;

          bot.sendMessage(chatId, 'Демо-версия бота закончилась. Для продолжения использования необходимо оплатить месячную подписку.');
        });
      } else {
        bot.sendMessage(chatId, 'Вы уже получили демо-версию бота на 24 часа.');
      }
    }
  });
});

// Обработчик команды /subscribe
bot.onText(/\/subscribe/, (msg) => {
  const chatId = msg.chat.id;

  // Проверка наличия пользователя в базе данных
  connection.query(`SELECT * FROM users WHERE chat_id = ${chatId}`, (error, results, fields) => {
    if (error) throw error;

    if (results.length === 0) {
      bot.sendMessage(chatId, 'Вы не получили демо-версию бота.');
    } else {
      const demoPeriod = results[0].demo_period;

      if (demoPeriod < new Date()) {
        bot.sendMessage(chatId, 'Демо-версия бота закончилась. Для продолжения использования необходимо оплатить месячную подписку.');
      } else {
        // Обновление даты окончания демо-периода и добавление месячной подписки
        connection.query(`UPDATE users SET demo_period = NOW() + INTERVAL 1 MONTH, subscription = NOW() + INTERVAL 1 MONTH WHERE chat_id = ${chatId}`, (error, results, fields) => {
          if (error) throw error;

          bot.sendMessage(chatId, 'Вы успешно оплатили месячную подписку. Теперь вы можете продолжить использование бота.');
        });
      }
    }
  });
});
