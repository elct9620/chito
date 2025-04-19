export type TextContent = {
	type: "text";
	text: string;
};

export type ImageContent = {
	type: "image";
	image: string;
};

export type UserContent = TextContent | ImageContent;

export type Message =
	| {
			role: "user";
			content: string | UserContent[];
	  }
	| {
			role: "assistant";
			content: string;
	  }
	| {
			role: "system";
			content: string;
	  };
