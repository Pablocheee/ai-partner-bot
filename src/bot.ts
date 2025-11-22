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

// Обработчик для полных сообщений /full_xxx
bot.hears(/^\/full_([a-z0-9_]+)$/, async (ctx) => {
  const messageId = ctx.match[1];
  const fullText = LongMessageHandler.getLongMessage(messageId);
  
  if (fullText) {
    await LongMessageHandler.sendLongMessage(ctx, fullText, messageId);
  } else {
    await ctx.reply('? Сообщение не найдено или устарело');
  }
});

// Обработчик для частей /parts_xxx
bot.hears(/^\/parts_([a-z0-9_]+)$/, async (ctx) => {
  const messageId = ctx.match[1];
  const fullText = LongMessageHandler.getLongMessage(messageId);
  
  if (fullText) {
    await LongMessageHandler.sendLongMessage(ctx, fullText, messageId);
  } else {
    await ctx.reply('? Сообщение не найдено или устарело');
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
    
    // Используем умный обработчик длинных сообщений
    await LongMessageHandler.sendLongMessage(ctx, text);
    
  } catch (error) {
    console.error('Error:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

bot.launch().then(() => {
  console.log('Bot started with smart long message handler');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
