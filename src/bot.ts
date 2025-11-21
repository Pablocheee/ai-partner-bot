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
  // Пропускаем команды
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

bot.launch().then(() => {
  console.log('Bot started with welcome message');
});