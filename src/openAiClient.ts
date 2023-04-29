import { Configuration, OpenAIApi } from "openai";
import chalk from "chalk";
import readline from "readline";
import clipboardy from "clipboardy";
import fs from "fs";
import { createSnippet, defaultConfig } from "./defaultValues.js";
import { helpMenu } from "./help.js";
import { ChatMessage, Config, Option } from "./types.js";
import os from "os";
const decoder = new TextDecoder("utf-8");

const copyToClipboard = async (text: string) => {
  try {
    await clipboardy.write(text);
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error);
  }
};

export class OpenAiClient {
  private openai: OpenAIApi;
  private messages: ChatMessage[];
  private config: Config = defaultConfig;
  private platform: NodeJS.Platform;

  constructor(config: Config) {
    this.platform = os.platform();
    this.config = config;
    this.messages = [{ role: "system", content: this.config?.systemPrompt }];
    const configuration = new Configuration({ apiKey: this.config.apiKey });
    this.openai = new OpenAIApi(configuration);
  }

  private async getCodeFromLastMessage() {
    const { data }: any = await this.openai.createChatCompletion({
      messages: [
        {
          role: "system",
          content: createSnippet,
        },
        {
          role: "user",
          content: this.messages[this.messages.length - 1].content,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const message = data.choices[0].message.content;
    return message;
  }

  private showHelp() {
    helpMenu();
  }

  private async chatCompletion(prompt: Option) {
    switch (prompt) {
      case "exit":
        process.exit(0);
      case "clear":
        console.clear();
        return new Promise((resolve) => resolve(this.run()));
      case "help":
        this.showHelp();
        return new Promise((resolve) => resolve(this.run()));
      case "copy":
        console.log(chalk["yellow"].italic("Copying..."));
        const message = await this.getCodeFromLastMessage();
        const { code } = JSON.parse(message);
        await copyToClipboard(code);
        console.log(chalk["green"]("Text copied to clipboard"));
        return new Promise((resolve) => resolve(this.run()));
      case "save":
        console.log(chalk["yellow"].italic("Saving..."));
        const saveMessage = await this.getCodeFromLastMessage();
        const {
          code: saveCode,
          language,
          snippetName,
          fileExtension,
        } = JSON.parse(saveMessage);
        // console.log({ code: saveCode, language, snippetName, fileExtension });

        const fileName = `${snippetName}.${fileExtension}`;
        const snippet = saveCode;

        if (!fs.existsSync(this.config.snippetFolder)) {
          fs.mkdirSync(this.config.snippetFolder);
        }
        const filePath = `${this.config.snippetFolder}/${fileName}`;
        fs.writeFileSync(filePath, snippet);
        console.log(chalk["green"](`Saved ${language} snippet at ${filePath}`));

        return new Promise((resolve) => resolve(this.run()));
      default:
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

          let resultText = "";
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
                  resultText += content;
                  const responseColor = this.config?.responseColor || "green";
                  process.stdout.write(chalk[responseColor](content));
                  return;
                }
              }
            }
            this.addAssistantMessage(resultText);
          });

          completion.data.on("end", () => resolve(this.run()));
          completion.data.on("error", (error: any) => reject(error));
        });
    }
  }

  private addAssistantMessage(content: string) {
    this.messages.push({ role: "assistant", content });
  }

  async run() {
    const userNameColor = this.config?.userNameColor || "blue";

    process.stdout.write(
      `\n\n${chalk[userNameColor].bold(this.config.userName)}: `
    );
    const input = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    input.on("line", (line: any) => {
      input.close();
      this.chatCompletion(line).catch(console.error);
    });
  }
}
