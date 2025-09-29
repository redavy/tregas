const { Telegraf } = require('telegraf');

// Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN;
const TARGET_USER_ID = parseInt(process.env.TARGET_USER_ID); // ID одноклассника
const GROUP_CHAT_ID = process.env.GGROUP_CHAT_ID; // ID вашей группы

// Сообщения бота (на английском для правдоподобности)
const WARNING_MESSAGES = [
    `⚠️ Automated Alert [Code: SPAM-042]\nYour message was automatically removed for spamming behavior.`,
    `⚠️ Automated Alert [Code: FLOOD-128]\nRapid-fire messages detected. Message deleted.`,
    `⚠️ Automated Alert [Code: CONTENT-311]\nMessage removed for violating platform guidelines.`,
    `⚠️ Automated Alert [Code: ABUSE-076]\nFrequent message editing detected. This is considered platform abuse.`
];

const bot = new Telegraf(BOT_TOKEN);

// Состояние бота (включать/выключать)
let isActive = false;

// Функция для отправки предупреждения
async function sendWarning(ctx, targetMessageId) {
    const randomMessage = WARNING_MESSAGES[Math.floor(Math.random() * WARNING_MESSAGES.length)];
    
    try {
        // Отправляем сообщение с reply на его сообщение (тег без упоминания)
        const warningMsg = await ctx.reply(randomMessage, {
            reply_to_message_id: targetMessageId,
            disable_notification: true
        });
        
        // Удаляем предупреждение через 5 секунд для чистоты
        setTimeout(async () => {
            try {
                await ctx.deleteMessage(warningMsg.message_id);
            } catch (e) {
                // Игнорируем ошибки удаления
            }
        }, 5000);
        
    } catch (error) {
        console.log('Warning message error:', error.message);
    }
}

// Обработчик сообщений от целевого пользователя
bot.on('message', async (ctx) => {
    if (!isActive) return;
    
    const message = ctx.message;
    
    // Проверяем, что сообщение от нужного пользователя и в нужном чате
    if (message.from.id === TARGET_USER_ID && message.chat.id.toString() === GROUP_CHAT_ID) {
        try {
            // Сначала отправляем предупреждение
            await sendWarning(ctx, message.message_id);
            
            // Затем удаляем его сообщение с задержкой
            setTimeout(async () => {
                try {
                    await ctx.deleteMessage(message.message_id);
                } catch (deleteError) {
                    console.log('Delete message error:', deleteError.message);
                }
            }, 1000); // Задержка в 1 секунду
            
        } catch (error) {
            console.log('Error processing message:', error.message);
        }
    }
});

// Команды управления в личке с ботом
bot.command('on', async (ctx) => {
    if (ctx.chat.type === 'private') {
        isActive = true;
        await ctx.reply('🟢 Auto-moderation ACTIVATED. Target user messages will be deleted with warnings.');
    }
});

bot.command('off', async (ctx) => {
    if (ctx.chat.type === 'private') {
        isActive = false;
        await ctx.reply('🔴 Auto-moderation DEACTIVATED.');
    }
});

// Статус бота
bot.command('status', async (ctx) => {
    if (ctx.chat.type === 'private') {
        await ctx.reply(`Status: ${isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}`);
    }
});

// Обработчик для Vercel
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (error) {
            console.error('Error handling update:', error);
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('Telegram Bot is running on Vercel');
    }
};

// Для локальной разработки
if (process.env.NODE_ENV === 'development') {
    bot.launch();
    console.log('Bot is running in development mode');
}
