import { Conversation, ConversationProvider } from "@entity/Conversation";

export interface TextMessagePresenter {
	setText(text: string): void;
}

export const IConversationRepository = Symbol("ConversationRepository");
export interface ConversationRepository {
	findByProvider(
		provider: ConversationProvider,
		id: string,
	): Promise<Conversation>;
	save(conversation: Conversation): Promise<void>;
}

export interface AssistantService {
	execute(conversation: Conversation): Promise<string>;
}

export interface OcrService {
	execute(image: string): Promise<string>;
}

export interface ReceiptNoteService {
	execute(conversation: Conversation): Promise<string>;
}
