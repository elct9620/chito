import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { container } from "tsyringe";

import { ConversationProvider } from "@entity/Conversation";
import { TelegramTextMessagePresenter } from "@presenter/TelegramTextMessagePresenter";
import { KvConversationRepository } from "@repository/KvConversationRepository";
import { AiSdkAssistantService } from "@service/AiSdkAssistantService";
import { AiSdkOcrService } from "@service/AiSdkOcrService";
import { AiSdkReceiptNoteService } from "@service/AiSdkReceiptNoteService";
import {
	AssistantService,
	ConversationRepository,
	OcrService,
	ReceiptNoteService,
} from "@usecase/interface";
import { ProcessPhotoUseCase } from "@usecase/ProcessPhotoUseCase";
import { ProcessUserQueryUseCase } from "@usecase/ProcessUserQueryUseCase";

const bot = container.resolve(Telegraf);

bot.on(message("text"), async (ctx) => {
	await ctx.sendChatAction("typing");

	const conversationId = ctx.message.chat.id.toString();
	const presenter = new TelegramTextMessagePresenter(conversationId);
	const repository = container.resolve<ConversationRepository>(
		KvConversationRepository,
	);
	const assistantService = container.resolve<AssistantService>(
		AiSdkAssistantService,
	);
	const usecase = new ProcessUserQueryUseCase(
		repository,
		assistantService,
		presenter,
	);

	await usecase.execute({
		provider: ConversationProvider.Telegram,
		conversationId,
		userQuery: ctx.message.text,
	});
	await presenter.render(ctx);
});

bot.on(message("photo"), async (ctx) => {
	await ctx.sendChatAction("typing");

	const conversationId = ctx.message.chat.id.toString();
	const presenter = new TelegramTextMessagePresenter(conversationId);
	const repository = container.resolve<ConversationRepository>(
		KvConversationRepository,
	);
	const ocrService = container.resolve<OcrService>(AiSdkOcrService);
	const receiptNoteService = container.resolve<ReceiptNoteService>(
		AiSdkReceiptNoteService,
	);
	
	const usecase = new ProcessPhotoUseCase(
		repository,
		ocrService,
		receiptNoteService,
		presenter,
	);

	const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
	const fileUrl = await ctx.telegram.getFileLink(fileId);

	await usecase.execute({
		provider: ConversationProvider.Telegram,
		conversationId,
		photoUrl: fileUrl.toString(),
	});
	
	await presenter.render(ctx);
});
