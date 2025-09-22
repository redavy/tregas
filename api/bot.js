import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// Обработчик команды /start
bot.start(async (ctx) => {
    console.log('Received start command from:', ctx.from.id);
    
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
    await ctx.answerCbQuery();
    await ctx.editMessageText('Поздравляем! Регистрация в клубе «Аквамарин» успешно завершена! Ваша анкета будет рассмотрена администратором. Ожидайте приглашения на тренировку. Спасибо за честность!');
});

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
    
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
