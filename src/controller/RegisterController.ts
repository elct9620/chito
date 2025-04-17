import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { Telegraf } from "telegraf";
import { container } from "tsyringe";

export const route = new Hono().get("/", async (c) => {
	const bot = container.resolve(Telegraf);

	await bot.telegram.setWebhook(`https://${env.TELEGRAM_BOT_DOMAIN}/webhook`);
	return c.text("Registered");
});
