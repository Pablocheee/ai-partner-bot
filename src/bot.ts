import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

const bot = new Telegraf(config.telegramToken);
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Функция для разбивки длинных сообщений
function splitMessage(text: string, maxLength: number = 4000): string[] {
  if (text.length <= maxLength) return [text];
  
  const messages = [];
  let currentMessage = '';
  
  const paragraphs = text.split('\n\n');
  
  for (const paragraph of paragraphs) {
    if ((currentMessage + paragraph).length + 2 > maxLength) {
      if (currentMessage) {
        messages.push(currentMessage.trim());
        currentMessage = '';
      }
      
      // Если один абзац слишком длинный, разбиваем по предложениям
      if (paragraph.length > maxLength) {
        const sentences = paragraph.split('. ');
        for (const sentence of sentences) {
          if ((currentMessage + sentence).length + 2 > maxLength) {
            if (currentMessage) {
              messages.push(currentMessage.trim());
              currentMessage = '';
            }
            messages.push(sentence.substring(0, maxLength));
          } else {
            currentMessage += sentence + '. ';
          }
        }
      } else {
        currentMessage = paragraph + '\n\n';
      }
    } else {
      currentMessage += paragraph + '\n\n';
    }
  }
  
  if (currentMessage) {
    messages.push(currentMessage.trim());
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
  // Пропускаем команды
  if (ctx.message.text.startsWith('/')) return;
  
  try {
    // Показываем что бот "печатает"
    await ctx.sendChatAction('typing');
    
    const result = await model.generateContent(ctx.message.text);
    const response = await result.response;
    const text = response.text();
    
    // Разбиваем длинные сообщения
    const messages = splitMessage(text);
    
    // Отправляем первое сообщение
    await ctx.reply(messages[0]);
    
    // Отправляем остальные сообщения с задержкой
    for (let i = 1; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Задержка 300мс
      await ctx.reply(messages[i]);
    }
    
  } catch (error: any) {
    console.error('Error:', error);
    await ctx.reply('Произошла ошибка при обработке запроса');
  }
});

bot.launch().then(() => {
  console.log('Bot started with message splitting');
});