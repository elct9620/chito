import { generateText, type LanguageModel } from "ai";
import { inject, injectable } from "tsyringe";

import { AssistantModel } from "@/container";
import { Conversation } from "@/entity/Conversation";
import { ReceiptNoteInstruction } from "@/entity/Instruction";
import { Message } from "@/entity/Message";
import { ConversationRepository, IConversationRepository, ReceiptNoteService } from "@/usecase/interface";

@injectable()
export class AiSdkReceiptNoteService implements ReceiptNoteService {
	constructor(
		@inject(AssistantModel) private readonly model: LanguageModel,
		@inject(IConversationRepository) private readonly repository: ConversationRepository,
	) {}

	async execute(
		conversation: Conversation,
		receiptContent: string,
	): Promise<string> {
		// 添加收據識別系統消息和用戶請求
		const systemMessage: Message = {
			role: "system",
			content: `The text recognized from the receipt is:
${receiptContent}`,
		};
		
		const userMessage: Message = {
			role: "user",
			content: "Help me to take a note of the receipt in Chinese (Taiwan)",
		};
		
		conversation.addMessages(systemMessage, userMessage);

		const { text } = await generateText({
			model: this.model,
			system: ReceiptNoteInstruction.content,
			messages: conversation.messages,
		});

		// 添加助手回覆
		const assistantMessage: Message = {
			role: "assistant",
			content: text,
		};
		conversation.addMessages(assistantMessage);

		// 保存更新後的對話
		await this.repository.save(conversation);

		return text;
	}
}
