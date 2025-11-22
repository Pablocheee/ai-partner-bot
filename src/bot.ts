import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

const bot = new Telegraf(config.telegramToken);
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Упрощенная функция разбивки сообщений
function splitMessage(text: string, maxLength: number = 4096): string[] {
  const messages: string[] = [];
  
  if (text.length <= maxLength) {
    return [text];
  }
  
  let startIndex = 0;
  while (startIndex < text.length) {
    let endIndex = startIndex + maxLength;
    
    // Если не конец текста, находим ближайший пробел для разрыва
    if (endIndex < text.length) {
      endIndex = text.lastIndexOf(' ', endIndex);
      if (endIndex <= startIndex) {
        endIndex = startIndex + maxLength;
      }
    }
    
    messages.push(text.substring(startIndex, endIndex).trim());
    startIndex = endIndex;
  }
  
  return messages;
}

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
    await ctx.sendChatAction('typing');
    
    const result = await model.generateContent(ctx.message.text);
    const response = await result.response;
    const text = response.text();
    
    // Разбиваем сообщение на части
    const messages = splitMessage(text);
    
    // Отправляем первую часть
    await ctx.reply(messages[0]);
    
    // Отправляем остальные части с задержкой
    for (let i = 1; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await ctx.reply(messages[i]);
    }
    
  } catch (error: any) {
    console.error('Error:', error);
    await ctx.reply('Произошла ошибка при обработке запроса. Попробуйте позже.');
  }
});

// Запуск бота
bot.launch().then(() => {
  console.log('Bot started with fixed message splitting');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));