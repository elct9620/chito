import { Message } from "@entity/Message";
import { ConversationRepository } from "@usecase/interface";

export class KvConversationRepository implements ConversationRepository {
	constructor(private readonly kv: KVNamespace) {}

	async find(id: string): Promise<{ messages: Message[] }> {
		const conversation = await this.kv.get<{ messages: Message[] }>(
			`conversation:${id}`,
			"json",
		);
		if (!conversation) {
			return { messages: [] };
		}
		return conversation;
	}

	async save(id: string, conversation: { messages: Message[] }): Promise<void> {
		await this.kv.put(`conversation:${id}`, JSON.stringify(conversation));
	}
}
