import { generateText, LanguageModelV1 } from "ai";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { container } from "tsyringe";

import { AssistantModel } from "@/container";
import { ReceiptSummaryInstruction } from "@/entity/Instruction";
import { AiSdkAssistantService } from "@/service/AiSdkAssistantService";
import { AiSdkOcrService } from "@/service/AiSdkOcrService";
import {
	AssistantService,
	ConversationRepository,
	IConversationRepository,
	OcrService,
} from "@/usecase/interface";

const bot = container.resolve(Telegraf);

const model = container.resolve<LanguageModelV1>(AssistantModel);
const repository = container.resolve<ConversationRepository>(
	IConversationRepository,
);

bot.on(message("text"), async (ctx) => {
	await ctx.sendChatAction("typing");

	const conversationId = ctx.message.chat.id.toString();
	let conversation = await repository.find(conversationId);

	conversation = {
		messages: [
			...conversation.messages,
			{
				role: "user",
				content: ctx.message.text,
			},
		],
	};

	const assistantService = container.resolve<AssistantService>(
		AiSdkAssistantService,
	);
	const reply = await assistantService.execute(conversation.messages);

	conversation = {
		...conversation,
		messages: [...conversation.messages, reply],
	};

	await repository.save(conversationId, conversation);

	if (reply.role === "assistant") {
		await ctx.reply(reply.content);
	}
});

bot.on(message("photo"), async (ctx) => {
	await ctx.sendChatAction("typing");

	const conversationId = ctx.message.chat.id.toString();
	let conversation = await repository.find(conversationId);

	const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
	const fileUrl = await ctx.telegram.getFileLink(fileId);

	const ocrService = container.resolve<OcrService>(AiSdkOcrService);
	const ocrText = await ocrService.execute(fileUrl.toString());

	conversation = {
		messages: [
			...conversation.messages,
			{
				role: "system",
				content: `The text recognized from the image is:
${ocrText}`,
			},
			{
				role: "user",
				content: `Help me to take a note of the receipt in Chinese (Taiwan)`,
			},
		],
	};

	const { text } = await generateText({
		model: model,
		system: ReceiptSummaryInstruction.content,
		messages: conversation.messages,
	});

	conversation = {
		...conversation,
		messages: [
			...conversation.messages,
			{
				role: "assistant",
				content: text,
			},
		],
	};

	await repository.save(conversationId, conversation);
	await ctx.reply(text);
});
