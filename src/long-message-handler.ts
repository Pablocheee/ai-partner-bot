// ... остальной код тот же ...

// ?? ВАРИАНТ С EMOJI (без русского текста)
await ctx.reply(
  preview + 
  `?? Message too long for Telegram\n` +
  `?? Full version: /full_${savedMessageId}\n` +
  `?? Get in parts: /parts_${savedMessageId}`
);

// ... остальной код ...
