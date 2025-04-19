import { Conversation } from "@entity/Conversation";
import { type Message } from "@entity/Message";

export interface AssistantService {
	execute(conversation: Conversation, mssages: Message[]): Promise<string>;
}

export interface OcrService {
	execute(image: string): Promise<string>;
}

export interface ReceiptNoteService {
	execute(conversation: Conversation, receiptContent: string): Promise<string>;
}
