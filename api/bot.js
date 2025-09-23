import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// Обработчик команды /start
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    console.log('Received start command from:', userId);
    
    await ctx.reply('Добро пожаловать в сервис «Помощь с домашкой»! Для начала работы необходимо подтвердить, что вы не робот.');
    
    const { Markup } = await import('telegraf');
    
    await ctx.reply(
        'Ответьте на вопрос: Как называется место, где группа мужчин занимается синхронным плаванием в обтягивающих купальниках?',
        Markup.inlineKeyboard([
            [Markup.button.callback('Бассейн', 'answer_1')],
            [Markup.button.callback('Водный стадион', 'answer_2')],
            [Markup.button.callback('Гей-клуб "Аквамарин"', 'answer_3')]
        ])
    );
});

// Обработчики действий
bot.action('answer_1', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText('Неправильный ответ. Попробуйте еще раз!');
});

bot.action('answer_2', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText('Неправильный ответ. Попробуйте еще раз!');
});

bot.action('answer_3', async (ctx) => {
    const userId = ctx.from.id;
    const userName = ctx.from.first_name || 'Участник';
    
    await ctx.answerCbQuery();
    
    // Отправляем финальное сообщение
    await ctx.editMessageText('Поздравляем! Регистрация в клубе «Аквамарин» успешно завершена!');
    
    // Основное информационное сообщение
    await ctx.reply(
        `🏆 **ИНФОРМАЦИЯ ДЛЯ УЧАСТНИКОВ АКЦИИ**\n\n` +
        `Конкурс "Новичок месяца" от клуба синхронного плавания "Аквамарин" завершён.\n` +
        `23 сентября мы проводили розыгрыш среди новых участков.\n\n` +
        `**ПОБЕДИТЕЛЬ:** [${userName}](tg://user?id=${userId})\n` +
        `*Поздравляем! С вами свяжутся для вручения приза.*\n\n` +
        `**ГЛАВНЫЙ ПРИЗ:**\n` +
        `- 2 пары эксклюзивных обтягивающих плавок: модель "BEEZBARA" и фирменная модель с логотипом клуба.\n` +
        `- Сертификат на 7 ночных тренировок в паре с нашими лучшими пловцами.\n` +
        `- Пожизненный абонемент на занятия с тренером **Дмитрием Потаповым** (стаж 5 лет, мастер спорта).\n\n` +
        `*Данный бот был временным аккаунтом для регистрации на конкурс.*\n` +
        `*С 25 сентября он прекращает работу.*\n\n` +
        `**Официальный клуб "Аквамарин" ждёт вас по адресу:**\n` +
        `Калининград, ул. Набережная, 15 (здание бассейна "Волна", 3 этаж).\n` +
        `**Первое занятие для новых членов клуба:** 28 сентября, 19:00.\n\n` +
        `*Для получения приза победителю необходимо иметь при себе паспорт и сменную обувь.*\n\n` +
        `С уважением,\n` +
        `Дмитрий,\n` +
        `CEO клуба "Аквамарин".`,
        { parse_mode: 'Markdown' }
    );
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
    await ctx.reply('Пожалуйста, используйте кнопки для ответа на вопрос.');
});

// Для Vercel - вебхук обработчик
export default async function handler(req, res) {
    if (req.method === 'POST') {
        console.log('Received webhook update:', JSON.stringify(req.body));
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
