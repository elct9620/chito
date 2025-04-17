import "reflect-metadata";

import { Hono } from "hono";
import { Telegraf } from "telegraf";
import { container } from "tsyringe";

import "./bot/telegram";
import { route as RegisterRoute } from "./controller/RegisterController";
import { route as RootRoute } from "./controller/RootController";

const app = new Hono();
const bot = container.resolve(Telegraf);

app.route("/", RootRoute);
app.route("/register", RegisterRoute);

app.post("/webhook", async (c) => {
	const body = await c.req.json();
	try {
		await bot.handleUpdate(body as any);
	} catch (error) {
		console.error("Error handling update:", error);
		return c.text("Error handling update", 500);
	}

	return c.text("OK");
});

export default app;
