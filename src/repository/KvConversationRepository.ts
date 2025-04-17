export type ConversationTextContentSchema = {
	type: "text";
	text: string;
};

export type ConversationImageContentSchema = {
	type: "image";
	image: string;
};

export type ConversationUserContentSchema =
	| ConversationTextContentSchema
	| ConversationImageContentSchema;

export type ConversationMessageSchema =
	| {
			role: "user";
			content: string | ConversationUserContentSchema[];
	  }
	| {
			role: "assistant";
			content: string;
	  }
	| {
			role: "system";
			content: string;
	  };

export type ConversationSchema = {
	messages: ConversationMessageSchema[];
};

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
