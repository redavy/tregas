import { Telegraf } from 'telegraf';
import { getClubStats, getPlayerStats } from './brawlstars';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Импортируем обработчики команд (аналогично твоим handlers/)
import clubHandler from '../handlers/club';
// ... остальные handlers

bot.use(clubHandler);
// ... остальные handlers

// Вебхук для Vercel
export default async (req, res) => {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body, res);
  } else {
    res.status(200).send('Use POST');
  }
};
