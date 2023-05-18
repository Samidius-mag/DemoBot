const TelegramBot = require('node-telegram-bot-api');
const MongoClient = require('mongodb').MongoClient;

const token = '6237100701:AAFDTCeZw8wWGc6MQw1oBvea6Nk-zKrV3t4';
const bot = new TelegramBot(token, { polling: true });

const url = 'mongodb://localhost:27017';
const dbName = 'users';
const collectionName = 'telegram_users';

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userFirstName = msg.from.first_name;
  const userLastName = msg.from.last_name;
  const userUsername = msg.from.username;

  MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
    if (err) throw err;

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    collection.findOne({ userId }, (err, user) => {
      if (err) throw err;

      if (!user) {
        const newUser = {
          userId,
          firstName: userFirstName,
          lastName: userLastName,
          username: userUsername,
          demoExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        };

        collection.insertOne(newUser, (err) => {
          if (err) throw err;

          bot.sendMessage(chatId, 'Welcome to the demo version of our bot!');
        });
      } else {
        const demoExpiresAt = new Date(user.demoExpiresAt);

        if (demoExpiresAt > new Date()) {
          bot.sendMessage(chatId, 'Welcome back to the demo version of our bot!');
        } else {
          bot.sendMessage(chatId, 'Your demo period has expired. Please subscribe to continue using our bot.');
        }
      }

      client.close();
    });
  });
});

bot.onText(/\/subscribe/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
    if (err) throw err;

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    collection.findOne({ userId }, (err, user) => {
      if (err) throw err;

      if (!user) {
        bot.sendMessage(chatId, 'You need to start the bot first before subscribing.');
      } else {
        const demoExpiresAt = new Date(user.demoExpiresAt);

        if (demoExpiresAt > new Date()) {
          bot.sendMessage(chatId, 'Your demo period has not expired yet. No need to subscribe.');
        } else {
          // Here you can implement your payment system logic
          // For this example, we will just update the user's demoExpiresAt to 30 days from now
          const newDemoExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

          collection.updateOne({ userId }, { $set: { demoExpiresAt: newDemoExpiresAt } }, (err) => {
            if (err) throw err;

            bot.sendMessage(chatId, 'Thank you for subscribing!');
          });
        }
      }

      client.close();
    });
  });
});
