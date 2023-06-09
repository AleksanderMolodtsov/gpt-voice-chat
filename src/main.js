import { Telegraf, session } from "telegraf";
import config from 'config';
import { message } from 'telegraf/filters';
import {  ogg } from './ogg.js'
import { openai } from "./openai.js";
import { code } from "telegraf/format";
import { sdk_instance as sdk } from "./sdk.js";



const INITIAL_SESSION = {
    messages: [],
}

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION;
    await ctx.reply('Жду вашего голосового или текстового сообщения');
})

bot.command('start', async (ctx) => {
    ctx.session = INITIAL_SESSION;
    await ctx.reply('Жду вашего голосового или текстового сообщения');
})

bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try {
        const username = String(ctx.message.from.username);
        if (username !== 'The_magnificent' && username !== 'senheleet') {
            ctx.reply('Доступ к боту ограничен.');
            return;
        }
        await ctx.reply(code('Обработка запроса...'));
        const text = ctx.message.text;
        const { message_id, chat: { id: chatId } } = await ctx.reply(code(`Ищу ответ на Ваш вопрос: "${text}"... ⏳`));
        await ctx.replyWithChatAction('typing');

        ctx.session.messages.push({role: openai.roles.USER, content: text});
        const response = await openai.chat(ctx.session.messages);

        ctx.session.messages.push({role: openai.roles.ASSISTANT, content: response.content});

        await ctx.telegram.editMessageText(chatId, message_id,0, response.content)
    } catch (e) {
        console.log(`Error while voice message: ${e}`)
    }
})

bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try {
        const username = String(ctx.message.from.username);
        if (username !== 'The_magnificent' && username !== 'senheleet') {
            ctx.reply('Доступ к боту ограничен.');
            return;
        }
        await ctx.reply(code('Обработка запроса...'));
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const oggPath = await ogg.create(link.href, userId);
        const mp3Path = await ogg.toMp3(oggPath, userId);

        const text = await openai.trascription(mp3Path);
        const { message_id, chat: { id: chatId } } = await ctx.reply(code(`Ищу ответ на Ваш вопрос: "${text}"... ⏳`));
        await ctx.replyWithChatAction('typing');

        ctx.session.messages.push({role: openai.roles.USER, content: text});
        const response = await openai.chat(ctx.session.messages);

        const speech = await sdk.textToSpeech(response.content);

        ctx.session.messages.push({role: openai.roles.ASSISTANT, content: response.content});

        await ctx.telegram.editMessageText(chatId, message_id,0, response.content)

        if (speech) {
            await ctx.replyWithVoice(speech);
        }
    } catch (e) {
        console.log(`Error while voice message: ${e}`)
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
process.on('uncaughtException', function (err) {
    console.log(err);
});
