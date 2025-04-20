import { generateText, type LanguageModel } from "ai";
import { inject, injectable } from "tsyringe";

import { AssistantModel } from "@/container";
import { Conversation } from "@/entity/Conversation";
import { ReceiptNoteInstruction } from "@/entity/Instruction";
import { ReceiptNoteService } from "@/usecase/interface";

@injectable()
export class AiSdkReceiptNoteService implements ReceiptNoteService {
	constructor(@inject(AssistantModel) private readonly model: LanguageModel) {}

	async execute(conversation: Conversation): Promise<string> {
		const { text } = await generateText({
			model: this.model,
			system: ReceiptNoteInstruction.content,
			messages: conversation.messages,
		});

		return text;
	}
}
