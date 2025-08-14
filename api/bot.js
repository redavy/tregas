const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Привет! Я работаю на Vercel! 🎢'));

// Важно: экспортируем как Vercel Serverless Function
module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body, res);
    } else {
      res.status(200).send('Use POST for Telegram Bot API');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
