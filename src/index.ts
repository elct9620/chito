import { Hono } from 'hono';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { env } from 'cloudflare:workers';

const app = new Hono();

const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN)

bot.on(message('text'), async (ctx) => {
	await ctx.reply('Hello World!');
})

app.get('/', (c) => {
	return c.text('Hello World!');
});

app.get('/register', async (c) => {
	await bot.telegram.setWebhook(
		`https://${env.TELEGRAM_BOT_DOMAIN}/${env.TELEGRAM_BOT_PATH ?? ""}`,
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
