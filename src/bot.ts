import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

const bot = new Telegraf(config.telegramToken);
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// спользуем webhook вместо polling чтобы избежать конфликта
bot.telegram.setWebhook('').then(() => {
  console.log('Webhook cleared');
});

bot.on('text', async (ctx) => {
  try {
    console.log('Received message:', ctx.message.text);
    
    const result = await model.generateContent(ctx.message.text);
    const response = await result.response;
    const text = response.text();
    
    console.log('Sending response:', text);
    await ctx.reply(text);
  } catch (error: any) {
    console.error('Error:', error.message);
    await ctx.reply('шибка: ' + error.message);
  }
});

// апускаем с очисткой предыдущих обновлений
bot.launch({
  dropPendingUpdates: true,
  allowedUpdates: ['message']
}).then(() => {
  console.log('Bot started successfully with conflict resolution');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
