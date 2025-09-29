import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);
const TARGET_USER_ID = parseInt(process.env.TARGET_USER_ID);
let isActive = false;

// Простые команды
bot.command('on', (ctx) => {
  if (ctx.chat.type === 'private') {
    isActive = true;
    ctx.reply('🟢 Activated');
  }
});

bot.command('off', (ctx) => {
  if (ctx.chat.type === 'private') {
    isActive = false;
    ctx.reply('🔴 Deactivated');
  }
});

// Обработчик сообщений
bot.on('message', async (ctx) => {
  if (!isActive) return;
  
  if (ctx.message.from.id === TARGET_USER_ID) {
    try {
      // Сначала удаляем его сообщение
      await ctx.deleteMessage();
      // Затем отправляем предупреждение
      await ctx.reply(`⚠️ Automated Alert [Code: SPAM-042]\nMessage removed.`);
    } catch (error) {
      console.log('Error:', error.message);
    }
  }
});

// Вебхук обработчик
export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error('Error:', error.message);
      res.status(200).send('OK'); // Всегда отвечаем 200 для Telegram
    }
  } else {
    res.status(200).json({ status: 'Bot running' });
  }
};
