import { ConversationProvider } from "@/entity/Conversation";
import { TelegramTextMessagePresenter } from "@/presenter/TelegramTextMessagePresenter";
import { AssistantService, ConversationRepository } from "./interface";

export class ProcessUserQueryUseCase {
	constructor(
		private readonly conversationRepository: ConversationRepository,
		private readonly assistantService: AssistantService,
		private readonly textMessagePresenter: TelegramTextMessagePresenter,
	) {}

	async execute(input: {
		provider: ConversationProvider;
		conversationId: string;
		userQuery: string;
	}): Promise<void> {
		const conversation = await this.conversationRepository.findByProvider(
			input.provider,
			input.conversationId,
		);

		conversation.addMessages({
			role: "user",
			content: input.userQuery,
		});

		const text = await this.assistantService.execute(conversation);
		this.textMessagePresenter.setText(text);

		conversation.addMessages({
			role: "assistant",
			content: text,
		});

		await this.conversationRepository.save(conversation);
	}
}
