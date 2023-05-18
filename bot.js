const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql');

const token = '6237100701:AAFDTCeZw8wWGc6MQw1oBvea6Nk-zKrV3t4';
const bot = new TelegramBot(token, { polling: true });

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Asetabalana14$',
  database: 'users'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as id ' + connection.threadId);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name;

  connection.query('SELECT * FROM users WHERE telegram_id = ?', [userId], (error, results, fields) => {
    if (error) throw error;

    if (results.length === 0) {
      connection.query('INSERT INTO users (telegram_id, username, first_name, last_name, demo_period) VALUES (?, ?, ?, ?, ?)', [userId, username, firstName, lastName, 1], (error, results, fields) => {
        if (error) throw error;
        bot.sendMessage(chatId, 'Welcome to our bot! You have a demo period of 24 hours.');
      });
    } else {
      const user = results[0];
      if (user.demo_period === 0) {
        bot.sendMessage(chatId, 'Your demo period has expired. Please subscribe to continue using our bot.');
      } else {
        bot.sendMessage(chatId, 'Welcome back! You have ' + user.demo_period + ' hours left in your demo period.');
      }
    }
  });
});

bot.onText(/\/subscribe/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  connection.query('SELECT * FROM users WHERE telegram_id = ?', [userId], (error, results, fields) => {
    if (error) throw error;

    if (results.length === 0) {
      bot.sendMessage(chatId, 'You need to start the bot first before subscribing.');
    } else {
      const user = results[0];
      if (user.demo_period === 0) {
        bot.sendMessage(chatId, 'Your demo period has expired. Please subscribe to continue using our bot.');
      } else {
        connection.query('UPDATE users SET demo_period = 0, subscribed = 1 WHERE telegram_id = ?', [userId], (error, results, fields) => {
          if (error) throw error;
          bot.sendMessage(chatId, 'Thank you for subscribing! You can now use our bot without any limitations.');
        });
      }
    }
  });
});

