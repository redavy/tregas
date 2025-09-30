import { Telegraf } from 'telegraf';

// Хардкод конфигурации
const BOT_TOKEN = '7862907987:AAEW81nxnF1_D8OfvhfJ70mpBa5bqoC8EDg';
const TARGET_USER_ID = 6705882256;
const GROUP_CHAT_ID = '-1002712293369';

const bot = new Telegraf(BOT_TOKEN);
let isActive = false;
let isSpamming = false;
let spamInterval = null;

// Сообщения бота (4 варианта)
const WARNING_MESSAGES = [
    `⚠️ Automated Alert [Code: SPAM-042]\nYour message was automatically removed for spamming behavior.\nPlease read the rules /help`,
    `⚠️ Automated Alert [Code: FLOOD-128]\nRapid-fire messages detected. Message deleted.\nPlease read the rules /help`,
    `⚠️ Automated Alert [Code: CONTENT-311]\nMessage removed for violating platform guidelines.\nPlease read the rules /help`,
    `⚠️ Automated Alert [Code: ABUSE-076]\nFrequent message editing detected. This is considered platform abuse.\nPlease read the rules /help`
];

// Список слов для команды /help
const WORDS_LIST = [
    "Говно,", "залупа,", "пенис,", "хер,", "давалка,", "хуй,", "блядина",
    "Головка,", "шлюха,", "жопа,", "член,", "еблан,", "петух…", "Мудила",
    "Рукоблуд,", "ссанина,", "очко,", "блядун,", "вагина",
    "Сука,", "ебланище,", "влагалище,", "пердун,", "дрочила",
    "Пидор,", "пизда,", "туз,", "малафья",
    "Гомик,", "мудила,", "пилотка,", "манда",
    "Анус,", "вагина,", "путана,", "педрила",
    "Шалава,", "хуило,", "мошонка,", "елда"
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
        ctx.reply(`Status: ${isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}`);
    }
});

// Команда /help
bot.command('help', (ctx) => {
    if (isSpamming) return; // Уже спамит
    
    isSpamming = true;
    let wordIndex = 0;
    
    spamInterval = setInterval(async () => {
        if (wordIndex >= WORDS_LIST.length) {
            clearInterval(spamInterval);
            isSpamming = false;
            return;
        }
        
        try {
            await ctx.reply(WORDS_LIST[wordIndex]);
            wordIndex++;
        } catch (error) {
            console.log('Error sending message:', error.message);
            clearInterval(spamInterval);
            isSpamming = false;
        }
    }, 1000); // Каждую секунду
});

// Команда остановки спама
bot.command('stop', (ctx) => {
    if (spamInterval) {
        clearInterval(spamInterval);
        isSpamming = false;
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
