import { createOpenAI } from "@ai-sdk/openai";
import { env } from "cloudflare:workers";
import { Telegraf } from "telegraf";
import { container } from "tsyringe";

import { KvConversationRepository } from "@/repository/KvConversationRepository";
import {
	ConversationRepository,
	IConversationRepository,
} from "@/usecase/interface";
import { LanguageModel } from "ai";

export const KvStorage = Symbol("KvStorage");
export const AssistantModel = Symbol("AssistantModel");
export const OcrModel = Symbol("OcrModel");

const provider = createOpenAI({
	apiKey: env.OPENAI_API_TOKEN,
	baseURL: env.CLOUDFLARE_AI_GATEWAY
		? `${env.CLOUDFLARE_AI_GATEWAY}/openai`
		: undefined,
	headers: {
		"cf-aig-metadata": JSON.stringify({
			DEPLOYMENT_ID: env.DEPLOYMENT.id,
		}),
	},
});

container.register(Telegraf, {
	useValue: new Telegraf(env.TELEGRAM_BOT_TOKEN),
});

container.register<LanguageModel>(AssistantModel, {
	useValue: provider("gpt-4o-mini"),
});
container.register<LanguageModel>(OcrModel, {
	useValue: provider("gpt-4.1-mini"),
});

container.register<KVNamespace>(KvStorage, {
	useValue: env.KV,
});

container.register<ConversationRepository>(IConversationRepository, {
	useClass: KvConversationRepository,
});
