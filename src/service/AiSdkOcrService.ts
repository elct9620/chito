import { generateText, type LanguageModel } from "ai";
import { inject, injectable } from "tsyringe";

import { OcrModel } from "@/container";
import { OcrInstruction } from "@/entity/Instruction";
import { OcrService } from "@/usecase/interface";

@injectable()
export class AiSdkOcrService implements OcrService {
	constructor(@inject(OcrModel) private readonly model: LanguageModel) {}

	async execute(image: string): Promise<string> {
		const { text } = await generateText({
			model: this.model,
			system: OcrInstruction.content,
			messages: [
				{
					role: "user",
					content: [{ type: "image", image }],
				},
			],
		});

		return text;
	}
}
