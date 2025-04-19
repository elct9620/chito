export class Instruction {
	constructor(public readonly content: string) {}
}

export const AssistantInstruction = new Instruction(
	`You are travel assistant. Help the user to resolve their question in Chinese (Taiwan)`,
);

export const OcrInstruction = new Instruction(
	`Convert the following document to markdown.
Return only the markdown with no explanation text. Do not include delimiters like '''markdown or '''.

RULES:
	- You must include all information on the page. Do not exclude headers, footers, or subtext.
	- Charts & infographics must be interpreted to a markdown format. Prefer table format when applicable.
	- For tables with double headers, prefer adding a new column.
	- Logos should be wrapped in square brackets. Ex: [Coca-Cola]`,
);

export const ReceiptSummaryInstruction = new Instruction(
	`Summarize receipt include the following information:
1. Do not include any markdown formatting.
2. Use bullet notes format with emojis e.g. 🏪, 📅, ⏰, 🧾, 💵.
2. Include store name, location, date and time of the receipt.
3. Include detail the items in receipt both original and translated to Chinese (Taiwan).
4. Include the total amount in the summary.

Do not include any other information not related to the receipt.`,
);
