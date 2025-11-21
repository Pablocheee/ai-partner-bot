import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';
import './server'; // server.ts теперь в той же папке src

const bot = new Telegraf(config.telegramToken);
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

bot.on('text', async (ctx) => {
  try {
    const result = await model.generateContent(ctx.message.text);
    const response = await result.response;
    await ctx.reply(response.text());
  } catch (error: any) {
    await ctx.reply('Ошибка: ' + error.message);
  }
});

bot.launch({
  dropPendingUpdates: true,
}).then(() => {
  console.log('Bot started successfully');
});
