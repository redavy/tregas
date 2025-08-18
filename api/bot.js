import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Easter Egg
bot.command('start', (ctx) => {
	return ctx.reply(
		"Правило первое: ... Скоро."
	);
});

bot.command('support', (ctx) => ctx.reply('Служба поддержки работает в канале @TregasSupport.'));
bot.command('commands', (ctx) => ctx.reply('Скоро.'));

bot.command('club', (ctx) => {
	if (ctx.chat.type === 'private') {
		return ctx.reply(
			'Ты думаешь, клубные правила существуют? Это иллюзия. Только в стае можно увидеть настоящую силу. Вернись в группу, если хочешь увидеть правду.'
		);
	} else {
		return ctx.reply(
			'Скоро.'
		);
	}
});

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
