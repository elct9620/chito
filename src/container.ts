import { env } from 'cloudflare:workers';
import { Telegraf } from 'telegraf';
import { container } from 'tsyringe';

container.register(Telegraf, {
	useValue: new Telegraf(env.TELEGRAM_BOT_TOKEN)
})
