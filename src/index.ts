import { Telegraf } from 'telegraf';
import { env } from 'cloudflare:workers';

const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN)

bot.on('message', (ctx) => {
	ctx.reply('Hello World!');
})

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method === 'POST') {
			const body = await request.json();
			try {
				await bot.handleUpdate(body as any);
			} catch (error) {
				console.error('Error handling update:', error);
				return new Response('Error handling update', { status: 500 });
			}

			return new Response('OK', { status: 200 });
		}

		if (request.url.endsWith('/register')) {
			await bot.telegram.setWebhook(
				`https://${env.TELEGRAM_BOT_DOMAIN}/${env.TELEGRAM_BOT_PATH}`,
			)
			return new Response('Webhook registered', { status: 200 });
		}

		return new Response('Hello World!');
	},
} satisfies ExportedHandler<Env>;
