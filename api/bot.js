const { Telegraf } = require('telegraf');
const { VercelRequest, VercelResponse } = require('@vercel/node');

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const bot = new Telegraf(BOT_TOKEN);

// Обработчик команды /start
bot.start((ctx) => ctx.reply('Привет! Я бот на Vercel! 🚀'));

// Включить вебхук для Vercel
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body, res);
  } else {
    res.status(200).json({ info: 'Телеграм бот работает!' });
  }
};
