import { Configuration, OpenAIApi } from "openai";
import readline from "readline";
import "dotenv/config";
import chalk from "chalk";

const decoder = new TextDecoder("utf-8");
const responseColor = "green";
const userNameColor = "blue";

const userName = process.env.USER!;
const systemPrompt =
  process.env.SYSTEM_PROMPT ||
  "You are an assistant that helps software developers get information from their terminal.";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

class OpenAiClient {
  private openai: OpenAIApi;
  private messages: ChatMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  constructor(apiKey: string) {
    const configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(configuration);
  }

  private async chatCompletion(prompt: string) {
    return new Promise(async (resolve, reject) => {
      this.messages.push({ role: "user", content: prompt });
      const completion: any = await this.openai.createChatCompletion(
        {
          messages: this.messages,
          model: "gpt-3.5-turbo",
          stream: true,
        },
        { responseType: "stream" }
      );

      completion.data.on("data", (chunk: any) => {
        const lines = decoder.decode(chunk).split("\n");
        const mappedLines = lines
          .map((line) => line.replace(/^data: /, "").trim())
          .filter((line) => line !== "" && line !== undefined);

        for (const line of mappedLines) {
          if (line !== "[DONE]") {
            const parsedLine = JSON.parse(line);
            const { choices } = parsedLine;
            const { delta } = choices[0];
            const { content } = delta;

            if (content) {
              process.stdout.write(chalk[responseColor](content));
            }
          }
        }
      });

      completion.data.on("end", () => resolve(this.run()));
      completion.data.on("error", (error: any) => reject(error));
    });
  }

  async run() {
    process.stdout.write(`\n\n${chalk[userNameColor](userName)}: `);
    const input = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    input.on("line", (line) => {
      input.close();
      this.chatCompletion(line).catch(console.error);
    });
  }
}

const openAiClient = new OpenAiClient(process.env.OPENAI_API_KEY!);

openAiClient.run();
