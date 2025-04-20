import { generateText, type LanguageModel } from "ai";
import { inject, injectable } from "tsyringe";

import { AssistantModel } from "@/container";
import { Conversation } from "@entity/Conversation";
import { AssistantInstruction } from "@entity/Instruction";
import { AssistantService } from "@usecase/interface";

@injectable()
export class AiSdkAssistantService implements AssistantService {
	constructor(@inject(AssistantModel) private readonly model: LanguageModel) {}

	async execute(conversation: Conversation): Promise<string> {
		const { text } = await generateText({
			model: this.model,
			system: AssistantInstruction.content,
			messages: conversation.messages,
		});

		return text;
	}
}
