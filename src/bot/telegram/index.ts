import { LanguageModelV1 } from "ai";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { container } from "tsyringe";

import { AssistantModel } from "@/container";
import { Conversation, ConversationProvider } from "@/entity/Conversation";
import { AiSdkAssistantService } from "@/service/AiSdkAssistantService";
import { AiSdkOcrService } from "@/service/AiSdkOcrService";
import { AssistantService, OcrService } from "@/usecase/interface";

const bot = container.resolve(Telegraf);

const model = container.resolve<LanguageModelV1>(AssistantModel);
bot.on(message("text"), async (ctx) => {
	await ctx.sendChatAction("typing");

	const conversationId = ctx.message.chat.id.toString();
	const conversation = new Conversation(
		conversationId,
		ConversationProvider.Telegram,
	);

	const assistantService = container.resolve<AssistantService>(
		AiSdkAssistantService,
	);
	const reply = await assistantService.execute(conversation, [
		{
			role: "user",
			content: ctx.message.text,
		},
	]);

	if (reply.role === "assistant") {
		await ctx.reply(reply.content);
	}
});

bot.on(message("photo"), async (ctx) => {
	await ctx.sendChatAction("typing");

	const conversationId = ctx.message.chat.id.toString();
	const conversation = new Conversation(
		conversationId,
		ConversationProvider.Telegram,
	);

	const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
	const fileUrl = await ctx.telegram.getFileLink(fileId);

	const ocrService = container.resolve<OcrService>(AiSdkOcrService);
	const ocrText = await ocrService.execute(fileUrl.toString());

	const assistantService = container.resolve<AssistantService>(
		AiSdkAssistantService,
	);
	const reply = await assistantService.execute(conversation, [
		{
			role: "system",
			content: `The text recognized from the image is:
${ocrText}`,
		},
		{
			role: "user",
			content: `Help me to take a note of the receipt in Chinese (Taiwan)`,
		},
	]);

	if (reply.role === "assistant") {
		await ctx.reply(reply.content);
	}
});
