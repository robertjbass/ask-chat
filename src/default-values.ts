import { Config } from '@/types'

export const defaultSystemPrompt = `You are an assistant that helps software developers get information from their terminal.`;

export const defaultConfig: Config = {
  apiKey: "",
  responseColor: "green",
  userNameColor: "blue",
  systemPrompt: defaultSystemPrompt,
  userName: process.env.USER || "User",
};
