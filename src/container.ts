import { env } from 'cloudflare:workers';
import { Telegraf } from 'telegraf';
import { createOpenAI } from '@ai-sdk/openai';
import { container } from 'tsyringe';

export const AssistantModel = Symbol('AssistantModel');
export const OcrModel = Symbol('OcrModel');

container.register(Telegraf, {
	useValue: new Telegraf(env.TELEGRAM_BOT_TOKEN)
})

const provider = createOpenAI({
	apiKey: env.OPENAI_API_TOKEN,
	baseURL: env.CLOUDFLARE_AI_GATEWAY ? `${env.CLOUDFLARE_AI_GATEWAY}/openai` : undefined
})
container.register(AssistantModel, {
	useValue: provider('gpt-4o-mini')
})
container.register(OcrModel, {
	useValue: provider('gpt-4o-mini')
})
