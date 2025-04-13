import { Hono } from 'hono';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from 'cloudflare:workers';

const app = new Hono();
const provider = createOpenAI({
	apiKey: env.OPENAI_API_TOKEN,
	baseURL: env.CLOUDFLARE_AI_GATEWAY ? `${env.CLOUDFLARE_AI_GATEWAY}/openai` : undefined
})
const model = provider('gpt-4o-mini')
const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN)

bot.on(message('text'), async (ctx) => {
	const { text } = await generateText({
		model: model,
		messages: [
			{
				role: 'user',
				content: ctx.message.text,
			}
		]
	})

	await ctx.reply(text);
})

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
