import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

const bot = new Telegraf(config.telegramToken);
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Обработчик команды /start
bot.start(async (ctx) => {
  const welcomeText = `Никаких лимитов и скрытых платежей.
Полный доступ к одному из самых мощных ИИ — без ограничений.🤗

🧠 1 МЛН+ токенов памяти
📚 В 8 раз больше, чем у конкурентов
💭 Помнит все детали ваших бесед
📄 Анализирует документы до 500 страниц

Просто напишите сообщение — и получите умный ответ!`;

  await ctx.reply(welcomeText);
});

// Обработчик обычных сообщений
bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) return;
  
  try {
    const result = await model.generateContent(ctx.message.text);
    const response = await result.response;
    await ctx.reply(response.text());
  } catch (error: any) {
    console.error('Error:', error);
    await ctx.reply('Произошла ошибка при обработке запроса');
  }
});

// Запуск бота с обработкой ошибок
async function startBot() {
  try {
    await bot.launch();
    console.log('Bot started successfully');
  } catch (error) {
    console.error('Failed to start bot:', error);
    // Ждем 10 секунд перед перезапуском
    setTimeout(startBot, 10000);
  }
}

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Запускаем бота
startBot();