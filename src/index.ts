import "reflect-metadata";

import { LanguageModelV1 } from "ai";
import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { Telegraf } from "telegraf";
import { container } from "tsyringe";

import "bot/telegram";
import { AssistantModel } from "./container";
import { route as RegisterRoute } from "./controller/RegisterController";
import { route as RootRoute } from "./controller/RootController";
import { KvConversationRepository } from "./repository/KvConversationRepository";

const app = new Hono();
const model = container.resolve<LanguageModelV1>(AssistantModel);
const highModel = container.resolve<LanguageModelV1>(AssistantModel);
const repository = new KvConversationRepository(env.KV);
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
