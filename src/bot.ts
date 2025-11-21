import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

const bot = new Telegraf(config.telegramToken);
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
  }
});

bot.on('text', async (ctx) => {
  try {
    // Добавляем промпт для лучшего русского языка
    const userMessage = ctx.message.text;
    const prompt = `Ответь на русском языке на следующий вопрос/сообщение: ${userMessage}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    await ctx.reply(response.text());
  } catch (error) {
    console.error('Error:', error);
    await ctx.reply('Произошла ошибка при обработке запроса');
  }
});

bot.launch().then(() => {
  console.log('Bot started with Gemini 2.0 Flash');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
