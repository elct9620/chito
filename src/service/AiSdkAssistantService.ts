import { generateText, type LanguageModel } from "ai";
import { inject, injectable } from "tsyringe";

import { AssistantModel } from "@/container";
import { Conversation } from "@entity/Conversation";
import { AssistantInstruction } from "@entity/Instruction";
import { Message } from "@entity/Message";
import { AssistantService, ConversationRepository, IConversationRepository } from "@usecase/interface";

@injectable()
export class AiSdkAssistantService implements AssistantService {
	constructor(
		@inject(AssistantModel) private readonly model: LanguageModel,
		@inject(IConversationRepository) private readonly repository: ConversationRepository,
	) {}

	async execute(
		conversation: Conversation,
		messages: Message[],
	): Promise<string> {
		// 添加新消息到對話
		conversation.addMessages(...messages);

		const { text } = await generateText({
			model: this.model,
			system: AssistantInstruction.content,
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
