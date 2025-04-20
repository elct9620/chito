import { Conversation, ConversationProvider } from "@entity/Conversation";
import { type Message } from "@entity/Message";

export const IConversationRepository = Symbol("ConversationRepository");
export interface ConversationRepository {
	findByProvider(
		provider: ConversationProvider,
		id: string,
	): Promise<Conversation>;
	save(conversation: Conversation): Promise<void>;
}

export interface AssistantService {
	execute(conversation: Conversation, mssages: Message[]): Promise<string>;
}

export interface OcrService {
	execute(image: string): Promise<string>;
}

export interface ReceiptNoteService {
	execute(conversation: Conversation, receiptContent: string): Promise<string>;
}
