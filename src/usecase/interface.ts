import { Conversation } from "@entity/Conversation";
import { type Message } from "@entity/Message";

export interface AssistantService {
	execute(conversation: Conversation, mssages: Message[]): Promise<Message>;
}

export interface OcrService {
	execute(image: string): Promise<string>;
}

export interface ReceiptNoteService {
	execute(receiptContent: string): Promise<Message>;
}
