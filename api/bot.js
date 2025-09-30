import { Telegraf } from 'telegraf';

// Хардкод конфигурации
const BOT_TOKEN = '7862907987:AAEW81nxnF1_D8OfvhfJ70mpBa5bqoC8EDg';
const TARGET_USER_ID = 6705882256;
const GROUP_CHAT_ID = '-1002712293369';

const bot = new Telegraf(BOT_TOKEN);
let isActive = false;

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

// Храним состояние для каждого чата
const chatStates = new Map();

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
bot.command('help', async (ctx) => {
    const chatId = ctx.chat.id;
    
    // Если уже идет спам в этом чате, останавливаем
    if (chatStates.has(chatId)) {
        chatStates.delete(chatId);
        return;
    }
    
    // Начинаем новый спам
    const state = {
        index: 0,
        lastSent: Date.now()
    };
    chatStates.set(chatId, state);
    
    // Отправляем первое слово
    if (state.index < WORDS_LIST.length) {
        await ctx.reply(WORDS_LIST[state.index]);
        state.index++;
        state.lastSent = Date.now();
    }
    
    // Сохраняем контекст для последующих сообщений
    state.ctx = ctx;
});

// Обработчик всех сообщений для продолжения спама
bot.on('message', async (ctx) => {
    const chatId = ctx.chat.id;
    
    // Проверяем, нужно ли продолжать спам в этом чате
    if (chatStates.has(chatId)) {
        const state = chatStates.get(chatId);
        const now = Date.now();
        
        // Проверяем, прошла ли хотя бы 1 секунда с последнего сообщения
        if (now - state.lastSent >= 1000 && state.index < WORDS_LIST.length) {
            await ctx.reply(WORDS_LIST[state.index]);
            state.index++;
            state.lastSent = now;
            
            // Если слова закончились, останавливаем спам
            if (state.index >= WORDS_LIST.length) {
                chatStates.delete(chatId);
            }
        }
    }
    
    // Оригинальная логика модерации
    if (!isActive) return;

    const message = ctx.message;
    
    // Проверяем, что сообщение от нужного пользователя в нужной группе
    if (message.from.id === TARGET_USER_ID && message.chat.id.toString() === GROUP_CHAT_ID) {
        try {
            // Случайное сообщение из 4 вариантов
            const randomMessage = WARNING_MESSAGES[Math.floor(Math.random() * WARNING_MESSAGES.length)];

            // Отправляем предупреждение с reply
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

            // Удаляем предупреждение бота через 5 секунд
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

// Команда остановки спама
bot.command('stop', (ctx) => {
    const chatId = ctx.chat.id;
    if (chatStates.has(chatId)) {
        chatStates.delete(chatId);
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
            res.status(200).send('OK');
        }
    } else {
        res.status(200).json({
            status: 'Bot is running',
            active: isActive
        });
    }
};
