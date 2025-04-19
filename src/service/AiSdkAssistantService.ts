import { generateText, type LanguageModel } from "ai";
import { inject, injectable } from "tsyringe";

import { AssistantModel, KvStorage } from "@/container";
import { Conversation } from "@entity/Conversation";
import { AssistantInstruction } from "@entity/Instruction";
import { Message } from "@entity/Message";
import { AssistantService } from "@usecase/interface";

@injectable()
export class AiSdkAssistantService implements AssistantService {
	constructor(
		@inject(AssistantModel) private readonly model: LanguageModel,
		@inject(KvStorage) private readonly kv: KVNamespace,
	) {}

	async execute(
		conversation: Conversation,
		messages: Message[],
	): Promise<Message> {
		const existMessage = await this.getMessages(conversation.id);

		const { text } = await generateText({
			model: this.model,
			system: AssistantInstruction.content,
			messages: [...existMessage, ...messages],
		});

		const replyMessage: Message = {
			role: "assistant",
			content: text,
		};

		await this.saveMessages(conversation.id, [
			...existMessage,
			...messages,
			replyMessage,
		]);

		return replyMessage;
	}

	private async getMessages(id: string): Promise<Message[]> {
		const conversation = await this.kv.get<{ messages: Message[] }>(
			`conversation:${id}`,
			"json",
		);
		if (!conversation) {
			return [];
		}
		return conversation.messages;
	}

	private async saveMessages(id: string, messages: Message[]): Promise<void> {
		await this.kv.put(`conversation:${id}`, JSON.stringify({ messages }));
	}
}
