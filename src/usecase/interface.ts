import { type Message } from "@entity/Message";

export const IConversationRepository = Symbol("ConversationRepository");
export interface ConversationRepository {
	find(id: string): Promise<{ messages: Message[] }>;
	save(id: string, conversation: { messages: Message[] }): Promise<void>;
}

export interface AssistantService {
	execute(messages: Message[]): Promise<Message>;
}

export interface OcrService {
	execute(image: string): Promise<string>;
}
