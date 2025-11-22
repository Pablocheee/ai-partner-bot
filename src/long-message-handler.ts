import { Telegraf } from 'telegraf';

// Храним длинные сообщения в памяти (в продакшене нужно использовать БД)
const messageStorage = new Map<string, string>();

export class LongMessageHandler {
  
  // Сохраняем длинное сообщение и возвращаем ID
  static saveLongMessage(text: string): string {
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    messageStorage.set(messageId, text);
    
    // Очищаем через час
    setTimeout(() => {
      messageStorage.delete(messageId);
    }, 60 * 60 * 1000);
    
    return messageId;
  }
  
  // Получаем сохраненное сообщение
  static getLongMessage(messageId: string): string | null {
    return messageStorage.get(messageId) || null;
  }
  
  // Разбиваем сообщение на части с навигацией
  static async sendLongMessage(ctx: any, text: string, messageId?: string) {
    const MAX_LENGTH = 3500; // Оставляем место для навигации
    
    if (text.length <= MAX_LENGTH) {
      await ctx.reply(text);
      return;
    }
    
    // Если сообщение очень длинное, сохраняем и даем ссылку
    if (text.length > 10000) {
      const savedMessageId = messageId || this.saveLongMessage(text);
      const preview = text.substring(0, 3000) + '\n\n...\n\n';
      
      await ctx.reply(
        preview + 
        `?? Сообщение слишком длинное для Telegram\n` +
        `?? Полная версия: /full_${savedMessageId}\n` +
        `??  Или получи частями: /parts_${savedMessageId}`
      );
      return;
    }
    
    // Разбиваем на части с навигацией
    const parts: string[] = [];
    for (let i = 0; i < text.length; i += MAX_LENGTH) {
      const part = text.substring(i, i + MAX_LENGTH);
      const partNumber = Math.floor(i / MAX_LENGTH) + 1;
      const totalParts = Math.ceil(text.length / MAX_LENGTH);
      
      parts.push(`[${partNumber}/${totalParts}]\n${part}`);
    }
    
    // Отправляем части
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) await new Promise(resolve => setTimeout(resolve, 500));
      await ctx.reply(parts[i]);
    }
  }
}
