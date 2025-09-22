import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const bot = new Telegraf(BOT_TOKEN);

// Обработчик команды /start
bot.start(async (ctx) => {
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

// Обработчики нажатий на кнопки
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

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
    await ctx.reply('Пожалуйста, используйте кнопки для ответа на вопрос.');
});

// Webhook обработчик для Vercel
export default async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (error) {
            console.error('Error handling update:', error);
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('Hello from Telegram Bot!');
    }
};

// Локальный запуск (для разработки)
if (process.env.NODE_ENV !== 'production') {
    bot.launch().then(() => {
        console.log('Бот запущен в режиме polling');
    });
}
