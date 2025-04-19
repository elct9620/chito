import { generateText, type LanguageModel } from "ai";
import { inject, injectable } from "tsyringe";

import { AssistantModel, KvStorage } from "@/container";
import { Conversation } from "@/entity/Conversation";
import { ReceiptNoteInstruction } from "@/entity/Instruction";
import { Message } from "@/entity/Message";
import { ReceiptNoteService } from "@/usecase/interface";

@injectable()
export class AiSdkReceiptNoteService implements ReceiptNoteService {
	constructor(
		@inject(AssistantModel) private readonly model: LanguageModel,
		@inject(KvStorage) private readonly kv: KVNamespace,
	) {}

	async execute(
		conversation: Conversation,
		receiptContent: string,
	): Promise<string> {
		const existMessage = await this.getMessages(conversation.id);

		const { text } = await generateText({
			model: this.model,
			system: ReceiptNoteInstruction.content,
			messages: [
				{
					role: "system",
					content: `The text recognized from the receipt is:
${receiptContent}`,
				},
				{
					role: "user",
					content: "Help me to take a note of the receipt in Chinese (Taiwan)",
				},
			],
		});

		await this.saveMessages(conversation.id, [
			...existMessage,
			{
				role: "system",
				content: `The text recognized from the receipt is:
${receiptContent}`,
			},
			{
				role: "user",
				content: "Help me to take a note of the receipt in Chinese (Taiwan)",
			},
			{
				role: "assistant",
				content: text,
			},
		]);

		return text;
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
