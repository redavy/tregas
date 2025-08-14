import { Telegraf } from 'telegraf';
import { getClubStats } from '../api/brawlstars';

export const clubHandler = (bot) => {
  bot.command('club', async (ctx) => {
    const data = await getClubStats();
    if (!data) {
      await ctx.reply('❌ Клуб не найден!');
      return;
    }

    const members = data.members.sort((a, b) => b.trophies - a.trophies);
    let reply = `🏆 <b>${data.name}</b> (${data.trophies} кубков)\n\nУчастники:\n`;

    members.forEach((member, index) => {
      reply += `${index + 1}. ${member.name} — 🏆 ${member.trophies}\n`;
    });

    await ctx.reply(reply, { parse_mode: 'HTML' });
  });
};
