export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type Config = {
  apiKey: string;
  snippetFolder: string;
  responseColor: ChalkColor;
  userNameColor: ChalkColor;
  systemPrompt: string;
  userName: string;
};

export type ChalkColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "grey";

export enum Option {
  Save = "save",
  Copy = "copy",
  Snippets = "snippets",
  Snippet = "snippet",
  Help = "help",
  Clear = "clear",
  Exit = "exit",
}
