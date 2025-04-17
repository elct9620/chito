import { generateText, LanguageModelV1 } from "ai";
import { env } from "cloudflare:workers";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { container } from "tsyringe";

import { KvConversationRepository } from "../../repository/KvConversationRepository";

import { AssistantModel, OcrModel } from "../../container";

const bot = container.resolve(Telegraf);

const model = container.resolve<LanguageModelV1>(AssistantModel);
const highModel = container.resolve<LanguageModelV1>(OcrModel);
const repository = new KvConversationRepository(env.KV);

bot.on(message("text"), async (ctx) => {
	const conversationId = ctx.message.chat.id.toString();
	let conversation = await repository.find(conversationId);

	conversation = {
		messages: [
			...conversation.messages,
			{
				role: "user",
				content: ctx.message.text,
			},
		],
	};

	const { text } = await generateText({
		model: model,
		system:
			"You are travel assistant. Help the user to resolve their question in Chinese (Taiwan)",
		messages: conversation.messages,
	});

	conversation = {
		...conversation,
		messages: [
			...conversation.messages,
			{
				role: "assistant",
				content: text,
			},
		],
	};

	await repository.save(conversationId, conversation);
	await ctx.reply(text);
});

bot.on(message("photo"), async (ctx) => {
	const conversationId = ctx.message.chat.id.toString();
	let conversation = await repository.find(conversationId);

	const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
	const fileUrl = await ctx.telegram.getFileLink(fileId);

	const { text: ocrText } = await generateText({
		model: highModel,
		system: `
Convert the following document to markdown.
Return only the markdown with no explanation text. Do not include delimiters like '''markdown or '''.

RULES:
	- You must include all information on the page. Do not exclude headers, footers, or subtext.
	- Charts & infographics must be interpreted to a markdown format. Prefer table format when applicable.
	- For tables with double headers, prefer adding a new column.
	- Logos should be wrapped in square brackets. Ex: [Coca-Cola]
		`,
		messages: [
			{
				role: "user",
				content: [{ type: "image", image: fileUrl.toString() }],
			},
		],
	});

	conversation = {
		messages: [
			...conversation.messages,
			{
				role: "system",
				content: `The text recognized from the image is:
${ocrText}`,
			},
			{
				role: "user",
				content: `Help me to take a note of the receipt in Chinese (Taiwan)`,
			},
		],
	};

	const { text } = await generateText({
		model: model,
		system: `Summarize receipt include the following information:
1. Do not include any markdown formatting.
2. Use bullet notes format with emojis e.g. 🏪, 📅, ⏰, 🧾, 💵.
2. Include store name, location, date and time of the receipt.
3. Include detail the items in receipt both original and translated to Chinese (Taiwan).
4. Include the total amount in the summary.

Do not include any other information not related to the receipt.`,
		messages: conversation.messages,
	});

	conversation = {
		...conversation,
		messages: [
			...conversation.messages,
			{
				role: "assistant",
				content: text,
			},
		],
	};

	await repository.save(conversationId, conversation);
	await ctx.reply(text);
});
