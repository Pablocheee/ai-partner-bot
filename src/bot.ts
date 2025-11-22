import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';
import { LongMessageHandler } from './long-message-handler';

const bot = new Telegraf(config.telegramToken);
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Обработчик команды /start
bot.start(async (ctx) => {
  const welcomeText = `Никаких лимитов и скрытых платежей.
Полный доступ к одному из самых мощных ИИ — без ограничений.??

?? 1 МЛН+ токенов памяти
?? В 8 раз больше, чем у конкурентов
?? Помнит все детали ваших бесед
?? Анализирует документы до 500 страниц

Просто напишите сообщение — и получите умный ответ!`;

  await ctx.reply(welcomeText);
});

// Обработчики для длинных сообщений
bot.hears(/^\/full_([a-z0-9_]+)$/, async (ctx) => {
  const messageId = ctx.match[1];
  const fullText = LongMessageHandler.getLongMessage(messageId);
  if (fullText) {
    await LongMessageHandler.sendLongMessage(ctx, fullText, messageId);
  } else {
    await ctx.reply('? Message not found');
  }
});

bot.hears(/^\/parts_([a-z0-9_]+)$/, async (ctx) => {
  const messageId = ctx.match[1];
  const fullText = LongMessageHandler.getLongMessage(messageId);
  if (fullText) {
    await LongMessageHandler.sendLongMessage(ctx, fullText, messageId);
  } else {
    await ctx.reply('? Message not found');
  }
});

// Обработчик обычных сообщений
bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) return;
  
  try {
    await ctx.sendChatAction('typing');
    const result = await model.generateContent(ctx.message.text);
    const response = await result.response;
    const text = response.text();
    await LongMessageHandler.sendLongMessage(ctx, text);
  } catch (error) {
    console.error('Error:', error);
    await ctx.reply('Error. Try again later.');
  }
});

// ?? РЕШАЕМ КОНФЛИКТ - используем webhook вместо polling
const startBot = async () => {
  try {
    // Используем webhook mode чтобы избежать конфликтов
    await bot.launch({ webhook: {} });
    console.log('? Bot started successfully with webhook');
  } catch (error: any) {
    console.error('? Failed to start bot:', error.message);
    // Не перезапускаем автоматически - ждем ручного вмешательства
  }
};

startBot();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
