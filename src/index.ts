import { Configuration, OpenAIApi } from "openai";
import readline from "readline";
import "dotenv/config";
import chalk from "chalk";
import fs from "fs";
import { createSnippet, defaultConfig, help } from "./defaultValues.js";
import { ChatMessage, Config } from "./types.js";
import { copyToClipboard } from "./helpers.js";
const decoder = new TextDecoder("utf-8");

class OpenAiClient {
  private openai: OpenAIApi;
  private messages: ChatMessage[];
  private config: Config = defaultConfig;

  constructor(config: Config) {
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

  private async chatCompletion(prompt: string) {
    if (prompt === "exit") process.exit(0);
    else if (prompt === "clear") {
      console.clear();
      return new Promise((resolve) => resolve(this.run()));
    } else if (prompt === "help") {
      console.log(help);
      return new Promise((resolve) => resolve(this.run()));
    } else if (prompt === "copy") {
      const message = await this.getCodeFromLastMessage();
      const { code } = JSON.parse(message);
      await copyToClipboard(code);
      return new Promise((resolve) => resolve(this.run()));
    } else if (prompt === "save") {
      const message = await this.getCodeFromLastMessage();
      const { code, language, snippetName, fileExtension } =
        JSON.parse(message);
      console.log({ code, language, snippetName, fileExtension });

      const fileName = `${snippetName}.${fileExtension}`;
      const snippet = code;

      console.log(`Saving ${language} snippet ${fileName}`);
      if (!fs.existsSync(this.config.snippetFolder)) {
        fs.mkdirSync(this.config.snippetFolder);
      }
      const filePath = `${this.config.snippetFolder}/${fileName}`;
      fs.writeFileSync(filePath, snippet);
      console.log(`Saved ${language} snippet at ${filePath}`);

      return new Promise((resolve) => resolve(this.run()));
    }
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
              // @ts-ignore
              process.stdout.write(chalk[responseColor](content));
            }
          } else {
            this.addAssistantMessage(resultText);
          }
        }
      });

      completion.data.on("end", () => resolve(this.run()));
      completion.data.on("error", (error: any) => reject(error));
    });
  }

  private addAssistantMessage(content: string) {
    this.messages.push({ role: "assistant", content });
  }

  async run() {
    const userNameColor = this.config?.userNameColor || "blue";

    // @ts-ignore
    process.stdout.write(`\n\n${chalk[userNameColor](this.config.userName)}: `);
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

const init = async () => {
  const configFileLocation = `${process.env.HOME}/.gpterminal.json`;
  if (!fs.existsSync(configFileLocation)) {
    fs.writeFileSync(configFileLocation, JSON.stringify({}));
  }
  const config: Config = JSON.parse(
    fs.readFileSync(configFileLocation, "utf8")
  );

  if (!config?.apiKey) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    await new Promise((resolve, _reject) => {
      rl.question("Enter your OpenAI API key: ", (answer) => {
        const config: Config = { ...defaultConfig, apiKey: answer };
        console.clear();
        fs.writeFileSync(configFileLocation, JSON.stringify(config));
        return resolve(config);
      });
    });
    await init();
  } else {
    const openAiClient = new OpenAiClient(config);
    await openAiClient.run();
  }
};

init();
