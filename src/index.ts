import { Hono } from 'hono';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from 'cloudflare:workers';
import { ConversationSchema, KvConversationRepository } from './repository/KvConversationRepository';

const app = new Hono();
const provider = createOpenAI({
	apiKey: env.OPENAI_API_TOKEN,
	baseURL: env.CLOUDFLARE_AI_GATEWAY ? `${env.CLOUDFLARE_AI_GATEWAY}/openai` : undefined
})
const model = provider('gpt-4o-mini')
const repository = new KvConversationRepository(env.KV)
const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN)

bot.on(message('text'), async (ctx) => {
	const conversationId = ctx.message.chat.id.toString();
	let conversation = await repository.find(conversationId);

	conversation = {
		messages: [
			...conversation.messages,
			{
				role: 'user',
				content: ctx.message.text,
			}
		]
	}

	const { text } = await generateText({
		model: model,
		system: 'You are a helpful assistant. Answer the user\'s question in Chinese (Taiwanses, zh-TW)',
		messages: conversation.messages
	})

	conversation = {
		...conversation,
		messages: [
			...conversation.messages,
			{
				role: 'assistant',
				content: text,
			}
		]
	}

	await repository.save(conversationId, conversation);
	await ctx.reply(text);
})

bot.on(message('photo'), async (ctx) => {
	const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
	const fileUrl = await ctx.telegram.getFileLink(fileId);

	const { text: ocrText } = await generateText({
		model: model,
		system: `
Convert the following document to markdown.
Return only the markdown with no explanation text. Do not include delimiters like '''markdown or '''.

RULES:
	- You must include all information on the page. Do not exclude headers, footers, or subtext.
	- Charts & infographics must be interpreted to a markdown format. Prefer table format when applicable.
	- For tables with double headers, prefer adding a new column.
	- Logos should be wrapped in square brackets. Ex: [Coca-Cola]
		`,
		messages: [
			{
				role: 'user',
				content: [
					{ type: 'text', text: 'Convert this image to readable markdown' },
					{ type: 'image', image: fileUrl.toString() },
				]
			}
		]
	})

	const { text } = await generateText({
		model: model,
		system: 'You are a helpful assistant. Answer the user\'s question in Chinese (Taiwanses, zh-TW)',
		messages: [
			{
				role: 'system',
				content: `The OCR result is: ${ocrText}`
			},
			{
				role: 'user',
				content: 'Please summarize receipt in bullet notes with emojis that I can understand easily, include original text and translation if not zh-TW. Do not include any markdown formatting. Make sure to include the location, date and time of the receipt and detail the items I bought. Do not include any other information.`'
			},
		]
	})

	await ctx.reply(text);
});

app.get('/', (c) => {
	return c.text('Hello World!');
});

app.get('/register', async (c) => {
	await bot.telegram.setWebhook(
		`https://${env.TELEGRAM_BOT_DOMAIN}/webhook`,
	);
	return c.text('Webhook registered');
});

app.post('/webhook', async (c) => {
	const body = await c.req.json();
	try {
		await bot.handleUpdate(body as any);
	} catch (error) {
		console.error('Error handling update:', error);
		return c.text('Error handling update', 500);
	}

	return c.text('OK');
});

export default app;
