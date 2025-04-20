import { inject, injectable } from "tsyringe";

import { KvStorage } from "@/container";
import { Conversation, ConversationProvider } from "@/entity/Conversation";
import { ConversationRepository, IConversationRepository } from "@/usecase/interface";

@injectable()
export class KvConversationRepository implements ConversationRepository {
	constructor(@inject(KvStorage) private readonly kv: KVNamespace) {}

	async findByProvider(
		provider: ConversationProvider,
		id: string
	): Promise<Conversation> {
		const conversationId = `${provider}-${id}`;
		const data = await this.kv.get<{ messages: any[] }>(
			`conversation:${conversationId}`,
			"json"
		);
		
		const conversation = new Conversation(id, provider);
		
		if (data && data.messages) {
			conversation.addMessages(...data.messages);
		}
		
		return conversation;
	}

	async save(conversation: Conversation): Promise<void> {
		await this.kv.put(
			`conversation:${conversation.id}`,
			JSON.stringify({ messages: conversation.messages })
		);
	}
}
