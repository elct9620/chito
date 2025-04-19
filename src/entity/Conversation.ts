export enum ConversationProvider {
	Telegram = "tg",
}

export enum ConversationType {
	Private = "private",
}

export class Conversation {
	private _type: ConversationType = ConversationType.Private;

	constructor(
		public readonly conversationId: string,
		public readonly provider: ConversationProvider,
	) {}

	public get id(): string {
		return `${this.provider}-${this.conversationId}`;
	}

	public get type(): ConversationType {
		return this._type;
	}
}
