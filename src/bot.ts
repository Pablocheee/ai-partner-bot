import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

const bot = new Telegraf(config.telegramToken);
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

bot.on('text', async (ctx) => {
  try {
    console.log('Received message:', ctx.message.text);
    
    const result = await model.generateContent(ctx.message.text);
    console.log('Gemini result:', result);
    
    const response = await result.response;
    console.log('Gemini response:', response);
    
    const text = response.text();
    console.log('Response text:', text);
    
    await ctx.reply(text || 'Пустой ответ от Gemini');
  } catch (error: any) {
    console.error('Full error:', error);
    await ctx.reply(`Ошибка: ${error.message || 'Unknown error'}`);
  }
});

bot.launch().then(() => {
  console.log('Bot started with diagnostics');
});
