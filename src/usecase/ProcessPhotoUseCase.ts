import { ConversationProvider } from "@/entity/Conversation";
import { TelegramTextMessagePresenter } from "@/presenter/TelegramTextMessagePresenter";
import { ConversationRepository, OcrService, ReceiptNoteService } from "./interface";

export class ProcessPhotoUseCase {
	constructor(
		private readonly conversationRepository: ConversationRepository,
		private readonly ocrService: OcrService,
		private readonly receiptNoteService: ReceiptNoteService,
		private readonly textMessagePresenter: TelegramTextMessagePresenter,
	) {}

	async execute(input: {
		provider: ConversationProvider;
		conversationId: string;
		photoUrl: string;
	}): Promise<void> {
		const conversation = await this.conversationRepository.findByProvider(
			input.provider,
			input.conversationId,
		);

		const ocrText = await this.ocrService.execute(input.photoUrl);

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

		const reply = await this.receiptNoteService.execute(conversation);
		this.textMessagePresenter.setText(reply);

		conversation.addMessages({
			role: "assistant",
			content: reply,
		});

		await this.conversationRepository.save(conversation);
	}
}
