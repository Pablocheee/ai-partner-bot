import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

const bot = new Telegraf(config.telegramToken);
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Простая и надежная функция разбивки
function splitMessage(text: string, maxLength: number = 4000): string[] {
  if (!text || text.length <= maxLength) return [text];
  
  const messages: string[] = [];
  const lines = text.split('\n');
  let currentMessage = '';
  
  for (const line of lines) {
    if ((currentMessage + line).length + 1 > maxLength) {
      if (currentMessage) {
        messages.push(currentMessage.trim());
        currentMessage = '';
      }
      
      // Если одна строка слишком длинная, разбиваем по словам
      if (line.length > maxLength) {
        let chunk = '';
        const words = line.split(' ');
        for (const word of words) {
          if ((chunk + word).length + 1 > maxLength) {
            if (chunk) {
              messages.push(chunk.trim());
              chunk = '';
            }
            // Если одно слово слишком длинное, разбиваем по символам
            if (word.length > maxLength) {
              for (let i = 0; i < word.length; i += maxLength) {
                messages.push(word.substring(i, i + maxLength));
              }
            } else {
              messages.push(word);
            }
          } else {
            chunk += word + ' ';
          }
        }
        if (chunk) messages.push(chunk.trim());
      } else {
        messages.push(line);
      }
    } else {
      currentMessage += line + '\n';
    }
  }
  
  if (currentMessage.trim()) {
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
  if (ctx.message.text.startsWith('/')) return;
  
  try {
    await ctx.sendChatAction('typing');
    
    const result = await model.generateContent(ctx.message.text);
    const response = await result.response;
    let text = response.text();
    
    // Ограничиваем максимальную длину на всякий случай
    if (text.length > 10000) {
      text = text.substring(0, 10000) + '\n\n[... сообщение было сокращено ...]';
    }
    
    const messages = splitMessage(text);
    
    for (let i = 0; i < messages.length; i++) {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      await ctx.reply(messages[i]);
    }
    
  } catch (error: any) {
    console.error('Error:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

bot.launch().then(() => {
  console.log('Bot started with improved message splitting');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));