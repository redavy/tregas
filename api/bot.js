import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// Обработчик команды /start
bot.start(async (ctx) => {
    // Основное информационное сообщение (без Markdown)
    await ctx.reply(
        `🏆 ИНФОРМАЦИЯ ДЛЯ УЧАСТНИКОВ АКЦИИ\n\n` +
        `Конкурс "Новичок месяца" от клуба синхронного плавания "Аквамарин" завершён.\n` +
        `23 сентября мы проводили розыгрыш среди новых участников.\n\n` +
        `ПОБЕДИТЕЛЬ: tg://openmessage?user_id=6705882256\n` +
        `Поздравляем! С вами свяжутся для вручения приза.\n\n` +
        `ГЛАВНЫЙ ПРИЗ:\n` +
        `- 2 пары эксклюзивных обтягивающих плавок: модель "BEEZBARA" и фирменная модель с логотипом клуба.\n` +
        `- Сертификат на 7 ночных тренировок в паре с нашими лучшими пловцами.\n` +
        `- Пожизненный абонемент на занятия с тренером Дмитрием Потаповым (стаж 5 лет, мастер спорта).\n\n` +
        `Данный бот был временным аккаунтом для регистрации на конкурс.\n` +
        `С 25 сентября он прекращает работу.\n\n` +
        `Официального бота клуба Аквамарин вы сможете получить в этом боте спустя некоторое время, когда мы его сделаем. Это будет ближе к первому занятию.\n` +
        `Первое занятие для новых членов клуба: 28 сентября, 19:00.\n\n` +
        `Для получения приза победителю необходимо иметь при себе паспорт и сменную обувь.\n\n` +
        `С уважением,\n` +
        `CEO клуба "Аквамарин".`
    );
});

// Обработка любых текстовых сообщений
bot.on('text', async (ctx) => {
    if (!ctx.message.text.startsWith('/')) {
        await ctx.reply('Для получения информации используйте команду /start');
    }
});

// Для Vercel - вебхук обработчик
export default async function handler(req, res) {
    if (req.method === 'POST') {
        console.log('Received webhook update');
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ ok: true });
        } catch (error) {
            console.error('Error handling update:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(200).json({
            message: 'Bot is running',
            usage: 'Send POST requests to this endpoint with Telegram updates'
        });
    }
}

// Если запускаем локально - используем polling
if (process.env.VERCEL !== '1') {
    bot.launch().then(() => {
        console.log('Bot started in polling mode');
    });

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
