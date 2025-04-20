import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { container } from "tsyringe";

import { ConversationProvider } from "@/entity/Conversation";
import { KvConversationRepository } from "@/repository/KvConversationRepository";
import { AiSdkAssistantService } from "@/service/AiSdkAssistantService";
import { AiSdkOcrService } from "@/service/AiSdkOcrService";
import { AiSdkReceiptNoteService } from "@/service/AiSdkReceiptNoteService";
import {
	AssistantService,
	ConversationRepository,
	OcrService,
	ReceiptNoteService,
} from "@/usecase/interface";

const bot = container.resolve(Telegraf);

bot.on(message("text"), async (ctx) => {
	await ctx.sendChatAction("typing");

	const repository = container.resolve<ConversationRepository>(
		KvConversationRepository,
	);
	const conversationId = ctx.message.chat.id.toString();
	const conversation = await repository.findByProvider(
		ConversationProvider.Telegram,
		conversationId,
	);

	conversation.addMessages({
		role: "user",
		content: ctx.message.text,
	});

	const assistantService = container.resolve<AssistantService>(
		AiSdkAssistantService,
	);
	const reply = await assistantService.execute(conversation);

	conversation.addMessages({
		role: "assistant",
		content: reply,
	});
	await repository.save(conversation);

	await ctx.reply(reply);
});

bot.on(message("photo"), async (ctx) => {
	await ctx.sendChatAction("typing");

	const repository = container.resolve<ConversationRepository>(
		KvConversationRepository,
	);
	const conversationId = ctx.message.chat.id.toString();
	const conversation = await repository.findByProvider(
		ConversationProvider.Telegram,
		conversationId,
	);

	const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
	const fileUrl = await ctx.telegram.getFileLink(fileId);

	const ocrService = container.resolve<OcrService>(AiSdkOcrService);
	const ocrText = await ocrService.execute(fileUrl.toString());

	conversation.addMessages(
		{
			role: "system",
			content: `The text recognized from the receipt is:
${ocrText}`,
		},
		{
			role: "user",
			content: "Help me to take a note of the receipt in Chinese (Taiwan)",
		},
	);

	const receiptNoteService = container.resolve<ReceiptNoteService>(
		AiSdkReceiptNoteService,
	);
	const reply = await receiptNoteService.execute(conversation);

	conversation.addMessages({
		role: "assistant",
		content: reply,
	});
	await repository.save(conversation);

	await ctx.reply(reply);
});
