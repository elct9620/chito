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

export const IConversationRepository = Symbol("ConversationRepository");
export interface ConversationRepository {
	find(id: string): Promise<ConversationSchema>;
	save(id: string, conversation: ConversationSchema): Promise<void>;
}
