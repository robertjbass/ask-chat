export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type Config = {
  apiKey: string;
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
  PWD = "pwd",
  CAT = "cat",
  DEBUG = "debug",
  COPY = "copy",
  HELP = "help",
  CLEAR = "clear",
  EXIT = "exit",
}
