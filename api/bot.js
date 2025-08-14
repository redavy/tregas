import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.command('start', (ctx) => ctx.reply('Бот работает на Vercel!'));

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body, res);
    } catch (e) {
      console.error('Error handling update:', e);
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(200).send('Use POST');
  }
};
