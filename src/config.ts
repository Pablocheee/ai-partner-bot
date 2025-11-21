import dotenv from 'dotenv';

dotenv.config();

export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY!,
  telegramToken: process.env.TELEGRAM_BOT_TOKEN!,
};
