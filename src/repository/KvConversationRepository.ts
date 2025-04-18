import { ConversationSchema } from "@usecase/interface";

export class KvConversationRepository {
	constructor(private readonly kv: KVNamespace) {}

	async find(id: string): Promise<ConversationSchema> {
		const conversation = await this.kv.get<ConversationSchema>(
			`conversation:${id}`,
			"json",
		);
		if (!conversation) {
			return { messages: [] };
		}
		return conversation;
	}

	async save(id: string, conversation: ConversationSchema): Promise<void> {
		await this.kv.put(`conversation:${id}`, JSON.stringify(conversation));
	}
}
