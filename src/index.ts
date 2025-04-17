import "reflect-metadata";

import { Hono } from 'hono';
import { container } from 'tsyringe';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { generateText, LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from 'cloudflare:workers';

import { ConversationSchema, KvConversationRepository } from './repository/KvConversationRepository';
import { AssistantModel } from "./container";
import { route as RootRoute } from './controller/RootController';
import { route as RegisterRoute } from './controller/RegisterController';
import "bot/telegram";


const app = new Hono();
const model = container.resolve<LanguageModelV1>(AssistantModel)
const highModel = container.resolve<LanguageModelV1>(AssistantModel);
const repository = new KvConversationRepository(env.KV)
const bot = container.resolve(Telegraf);

app.route('/', RootRoute);
app.route('/register', RegisterRoute);

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
