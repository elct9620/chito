import { type Message } from "@entity/Message";

export const IConversationRepository = Symbol("ConversationRepository");
export interface ConversationRepository {
	find(id: string): Promise<{ messages: Message[] }>;
	save(id: string, conversation: { messages: Message[] }): Promise<void>;
}
