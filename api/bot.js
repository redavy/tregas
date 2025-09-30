import { Telegraf } from 'telegraf';
// I FOUND IT HARD TO FIND
// Хардкод конфигурации
const BOT_TOKEN = '7862907987:AAEW81nxnF1_D8OfvhfJ70mpBa5bqoC8EDg';
const TARGET_USER_ID = 6705882256;
const GROUP_CHAT_ID = '-1002712293369';

const bot = new Telegraf(BOT_TOKEN);
let isActive = false;

// Сообщения бота (4 варианта)
const WARNING_MESSAGES = [
    `⚠️ Automated Alert [Code: SPAM-042]\nYour message was automatically removed for spamming behavior.`,
    `⚠️ Automated Alert [Code: FLOOD-128]\nRapid-fire messages detected. Message deleted.`,
    `⚠️ Automated Alert [Code: CONTENT-311]\nMessage removed for violating platform guidelines.`,
    `⚠️ Automated Alert [Code: ABUSE-076]\nFrequent message editing detected. This is considered platform abuse.`
];

// Команды управления
bot.command('on', (ctx) => {
    if (ctx.chat.type === 'private') {
        isActive = true;
        ctx.reply('🟢 Auto-moderation ACTIVATED. Target user messages will be deleted with warnings.');
    }
});

bot.command('off', (ctx) => {
    if (ctx.chat.type === 'private') {
        isActive = false;
        ctx.reply('🔴 Auto-moderation DEACTIVATED.');
    }
});

bot.command('status', (ctx) => {
    if (ctx.chat.type === 'private') {
        ctx.reply(`Status: ${isActive ? '🟢 ACTIVE' : ' 🔴 INACTIVE'}`);
    }
});

// Обработчик сообщений
bot.on('message', async (ctx) => {
    if (!isActive) return;

    const message = ctx.message;

    // Проверяем, что сообщение от нужного пользователя в нужной группе
    if (message.from.id === TARGET_USER_ID && message.chat.id.toString() === GROUP_CHAT_ID) {
        try {
            // Случайное сообщение из 4 вариантов
            const randomMessage = WARNING_MESSAGES[Math.floor(Math.random() * WARNING_MESSAGES.length)];

            // Отправляем предупреждение с reply (это создаст "тег" без упоминания)
            const warningMsg = await ctx.reply(randomMessage, {
                reply_to_message_id: message.message_id,
                disable_notification: true
            });

            // Удаляем его сообщение через 1 секунду
            setTimeout(async () => {
                try {
                    await ctx.deleteMessage(message.message_id);
                } catch (deleteError) {
                    console.log('Delete message error:', deleteError.message);
                }
            }, 1000);

            // Удаляем предупреждение бота через 5 секунд для чистоты
            setTimeout(async () => {
                try {
                    await ctx.deleteMessage(warningMsg.message_id);
                } catch (e) {
                    // Игнорируем ошибки удаления
                }
            }, 5000);

        } catch (error) {
            console.log('Error processing message:', error.message);
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
            console.error('Webhook error:', error.message);
            res.status(200).send('OK'); // Всегда отвечаем 200 для Telegram
        }
    } else {
        res.status(200).json({
            status: 'Bot is running',
            active: isActive
        });
    }
};
