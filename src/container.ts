import { createOpenAI } from "@ai-sdk/openai";
import { env } from "cloudflare:workers";
import { Telegraf } from "telegraf";
import { container } from "tsyringe";

export const KvStorage = Symbol("KvStorage");
export const AssistantModel = Symbol("AssistantModel");
export const OcrModel = Symbol("OcrModel");

container.register(Telegraf, {
	useValue: new Telegraf(env.TELEGRAM_BOT_TOKEN),
});

const provider = createOpenAI({
	apiKey: env.OPENAI_API_TOKEN,
	baseURL: env.CLOUDFLARE_AI_GATEWAY
		? `${env.CLOUDFLARE_AI_GATEWAY}/openai`
		: undefined,
	headers: {
		"cf-aig-metadata": JSON.stringify({
			VERSION: env.VERSION_METADATA.id,
		}),
	},
});
container.register(AssistantModel, {
	useValue: provider("gpt-4o-mini"),
});
container.register(OcrModel, {
	useValue: provider("gpt-4.1-mini"),
});

container.register(KvStorage, {
	useValue: env.KV,
});
