const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '8338569920:AAEQ8B29xE5vXAvqUYjIH7SLYxXAkovDPUU';
const bot = new Telegraf(BOT_TOKEN);

// Обработчик команды /start
bot.start(async (ctx) => {
    await ctx.reply('Добро пожаловать в сервис «Помощь с домашкой»! Для начала работы необходимо подтвердить, что вы не робот.');
    
    // Отправляем вопрос с кнопками
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
    await ctx.answerCbQuery(); // Подтверждаем нажатие
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

// Обработка текстовых сообщений (если пользователь напишет текст вместо нажатия кнопки)
bot.on('text', async (ctx) => {
    await ctx.reply('Пожалуйста, используйте кнопки для ответа на вопрос.');
});

// Запуск бота
bot.launch()
    .then(() => {
        console.log('Бот успешно запущен!');
    })
    .catch((err) => {
        console.error('Ошибка запуска бота:', err);
    });

// Корректное завершение работы при остановке процесса
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

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
