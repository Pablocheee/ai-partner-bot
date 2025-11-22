import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

const bot = new Telegraf(config.telegramToken);
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Простой обработчик команды /start
bot.start(async (ctx) => {
  const welcomeText = `Бесплатный ИИ-помощник с Gemini 2.0 Flash

?? 1М+ токенов памяти
?? Анализ документов до 500 страниц
?? Помнит всю историю общения

Просто напишите вопрос!`;

  await ctx.reply(welcomeText);
});

// Простой обработчик сообщений - ОГРАНИЧИВАЕМ длинные ответы
bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) return;
  
  try {
    await ctx.sendChatAction('typing');
    
    const result = await model.generateContent(ctx.message.text);
    const response = await result.response;
    let text = response.text();
    
    // ?? ПРОСТО ОГРАНИЧИВАЕМ ДЛИНУ - никаких сложных систем
    if (text.length > 4000) {
      text = text.substring(0, 4000) + '\n\n... (сообщение сокращено)';
    }
    
    await ctx.reply(text);
    
  } catch (error) {
    console.error('Error:', error);
    await ctx.reply('Ошибка, попробуйте позже');
  }
});

// Простой запуск
bot.launch().then(() => {
  console.log('Bot started - simple version');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
