import { LanguageModelV1 } from "ai";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { container } from "tsyringe";

import { AssistantModel } from "@/container";
import { Conversation, ConversationProvider } from "@/entity/Conversation";
import { AiSdkAssistantService } from "@/service/AiSdkAssistantService";
import { AiSdkOcrService } from "@/service/AiSdkOcrService";
import { AiSdkReceiptNoteService } from "@/service/AiSdkReceiptNoteService";
import {
	AssistantService,
	ConversationRepository,
	IConversationRepository,
	OcrService,
	ReceiptNoteService,
} from "@/usecase/interface";

const bot = container.resolve(Telegraf);
const repository = container.resolve<ConversationRepository>(IConversationRepository);

bot.on(message("text"), async (ctx) => {
	await ctx.sendChatAction("typing");

	const conversationId = ctx.message.chat.id.toString();
	const conversation = await repository.findByProvider(
		ConversationProvider.Telegram,
		conversationId
	);

	// 添加用戶消息
	conversation.addMessages({
		role: "user",
		content: ctx.message.text,
	});

	// 使用助手服務生成回覆
	const assistantService = container.resolve<AssistantService>(
		AiSdkAssistantService,
	);
	const reply = await assistantService.execute(conversation);

	// 添加助手回覆並保存對話
	conversation.addMessages(reply);
	await repository.save(conversation);

	await ctx.reply(reply.content);
});

bot.on(message("photo"), async (ctx) => {
	await ctx.sendChatAction("typing");

	const conversationId = ctx.message.chat.id.toString();
	const conversation = await repository.findByProvider(
		ConversationProvider.Telegram,
		conversationId
	);

	const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
	const fileUrl = await ctx.telegram.getFileLink(fileId);

	// 使用OCR服務識別圖片文字
	const ocrService = container.resolve<OcrService>(AiSdkOcrService);
	const ocrText = await ocrService.execute(fileUrl.toString());

	// 添加系統消息和用戶請求
	conversation.addMessages(
		{
			role: "system",
			content: `The text recognized from the receipt is:
${ocrText}`,
		},
		{
			role: "user",
			content: "Help me to take a note of the receipt in Chinese (Taiwan)",
		}
	);

	// 使用收據筆記服務生成回覆
	const receiptNoteService = container.resolve<ReceiptNoteService>(
		AiSdkReceiptNoteService,
	);
	const reply = await receiptNoteService.execute(conversation);

	// 添加助手回覆並保存對話
	conversation.addMessages(reply);
	await repository.save(conversation);

	await ctx.reply(reply.content);
});
