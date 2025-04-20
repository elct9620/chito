import { Message } from "./Message";

export enum ConversationProvider {
	Telegram = "tg",
}

export enum ConversationType {
	Private = "private",
}

export class Conversation {
	private _type: ConversationType = ConversationType.Private;
	private _messages: Message[] = [];

	constructor(
		public readonly conversationId: string,
		public readonly provider: ConversationProvider,
	) {}

	public get id(): string {
		return `${this.provider}-${this.conversationId}`;
	}

	public get messages(): Message[] {
		return [...this._messages];
	}

	public get type(): ConversationType {
		return this._type;
	}

	public addMessage(message: Message): void {
		this._messages = [...this._messages, message];
	}
}
