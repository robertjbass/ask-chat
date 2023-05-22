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

type BaseColor =
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

export type ChalkColor = `bg${Capitalize<BaseColor>}` | BaseColor;

export enum Option {
  SAVE = "save",
  SAVE_FILE = "savefile",
  PWD = "pwd",
  CAT = "cat",
  DEBUG = "debug",
  COPY = "copy",
  SNIPPETS = "snippets",
  SNIPPET = "snippet",
  HELP = "help",
  CLEAR = "clear",
  EXIT = "exit",
}
