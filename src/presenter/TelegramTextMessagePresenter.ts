import { Telegram } from "telegraf";

import { TextMessagePresenter } from "@usecase/interface";

export class TelegramTextMessagePresenter implements TextMessagePresenter {
	private text: string | null = null;

	constructor(private readonly chatId: string) {}

	setText(text: string): void {
		this.text = text;
	}

	async render(ctx: { telegram: Telegram }): Promise<void> {
		if (!this.text) {
			// NOTE: Setup a global error handler to catch this error
			console.error("Text is not set");
			return;
		}

		await ctx.telegram.sendMessage(this.chatId, this.text);
	}
}
