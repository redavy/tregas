import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.command('start', (ctx) => ctx.reply('Скоро.'));
bot.command('support', (ctx) => ctx.reply('Служба поддержки работает в канале @TregasSupport.'));
bot.command('club', (ctx) => ctx.reply('Скоро.'));
bot.command('commands', (ctx) => ctx.reply('Скоро.'));

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
