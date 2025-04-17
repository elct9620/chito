import { Hono } from "hono";
import { Telegraf } from "telegraf";
import { container } from "tsyringe";

export const route = new Hono().post("/", async (c) => {
	const body = await c.req.json();
	const bot = container.resolve(Telegraf);
	
	try {
		await bot.handleUpdate(body as any);
	} catch (error) {
		console.error("Error handling update:", error);
		return c.text("Error handling update", 500);
	}

	return c.text("OK");
});
