export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type Config = {
  apiKey: string;
  snippetFolder: string;
  responseColor: string;
  userNameColor: string;
  systemPrompt: string;
  userName: string;
};
