import { Configuration, OpenAIApi } from "openai";
import chalk from "chalk";
import readline from "readline";
import clipboardy from "clipboardy";
import fs from "fs";
import { highlight } from "cli-highlight";
import { createSnippet, defaultConfig } from "./defaultValues.js";
import { createCenteredString, helpMenu } from "./help.js";
import { ChatMessage, Config, Option } from "./types.js";
import os from "os";
import { TextDecoder } from "util";
const decoder = new TextDecoder("utf-8");

const copyToClipboard = async (text: string) => {
  try {
    await clipboardy.write(text);
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error);
  }
};

const sanitize = (name: string) => {
  return name
    .toLowerCase()
    .split(" ")
    .join("")
    .split("-")
    .join("")
    .split("_")
    .join("");
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

  private showSnippet(snippetName: string) {
    const snippetNameAsNumber = parseInt(snippetName);
    const snippetNameIsNumber = !isNaN(snippetNameAsNumber);
    const snippets = fs.readdirSync(this.config.snippetFolder);

    if (snippetNameIsNumber) {
      if (snippetNameAsNumber > snippets.length || snippetNameAsNumber < 1) {
        console.log(`
${chalk["red"].bold(`Snippet ${snippetNameAsNumber} does not exist`)}
${chalk["yellow"](`Please enter 'snippet <1-${snippets.length}>'`)} ${chalk[
          "blue"
        ].italic("or")} ${chalk["yellow"]("'snippets' for a list")}`);
        return;
      }
      let i = 1;
      for (const snippet of snippets) {
        if (i === snippetNameAsNumber) {
          snippetName = snippet;
        }
        i++;
      }
    }

    if (!snippets.includes(snippetName)) {
      const snippetsMap = snippets.map((snippet) => {
        const key = sanitize(snippet.split(".")[0]);
        return { [`${key}`]: snippet };
      });

      const snippetNameAsKey = sanitize(snippetName);
      for (const snippet of snippetsMap) {
        const [[key, value]] = Object.entries(snippet);
        if (key === snippetNameAsKey) snippetName = value;
      }
    }

    const filePath = `${this.config.snippetFolder}/${snippetName}`;
    const snippet = fs.readFileSync(filePath, "utf8");

    console.log(`
${chalk["bgCyan"]["blue"].bold(createCenteredString(filePath))}

${highlight(snippet, {
  language: snippetName.split(".")[1],
})}
`);
  }

  private saveSnippet({
    snippet,
    snippetName,
    fileExtension,
    language,
  }: {
    snippet: string;
    snippetName: string;
    fileExtension: string;
    language: string;
  }) {
    const fileName = `${snippetName}.${fileExtension}`;

    if (!fs.existsSync(this.config.snippetFolder)) {
      fs.mkdirSync(this.config.snippetFolder);
    }
    const filePath = `${this.config.snippetFolder}/${fileName}`;
    fs.writeFileSync(filePath, snippet);
    console.log(chalk["green"](`Saved ${language} snippet at ${filePath}`));
  }

  private showSnippets() {
    const snippets = fs.readdirSync(this.config.snippetFolder);
    console.log(
      `\n${chalk["bgCyan"]["blue"].bold(createCenteredString("SNIPPETS"))}\n`
    );
    let list = "";
    let i = 1;
    for (const snippet of snippets) {
      list += `${chalk["blue"].bold(i)} ${snippet}\n`;
      i++;
    }
    console.log(list);
  }

  private readFile(fPath: string) {
    const isAbsolutePath = fPath.startsWith("/");
    let filePath = fPath.split(" ").join("");

    if (!isAbsolutePath) {
      const currentDirectory = process.cwd();
      filePath = `${currentDirectory}/${filePath}`;
    }

    try {
      const file = fs.readFileSync(filePath, "utf8");
      return file;
    } catch {
      console.log(chalk["red"](`File ${filePath} does not exist`));
    }
  }

  private cat(fPath: string) {
    if (fPath === "") return new Promise((resolve) => resolve(this.run()));

    const file = this.readFile(fPath);
    if (!file) return new Promise((resolve) => resolve(this.run()));
    try {
      console.log(highlight(file, { language: fPath.split(".")[1] }));
    } catch {
      console.log(
        chalk["red"](`No syntax highlighting for this file type\n\n`)
      );
      console.log(file);
    }
  }

  private async debugFile(fPath: string) {
    if (fPath === "") return new Promise((resolve) => resolve(this.run()));

    const file = this.readFile(fPath);
    if (!file) return new Promise((resolve) => resolve(this.run()));

    try {
      console.log(highlight(file, { language: fPath.split(".")[1] }));
    } catch {
      console.log(
        chalk["red"](`No syntax highlighting for this file type\n\n`)
      );
    }
    return `Find the bug(s) in this file:
${file}`;
  }

  private async copy() {
    console.log(chalk["yellow"].italic("Copying..."));
    const message = await this.getCodeFromLastMessage();
    const { code } = JSON.parse(message);
    await copyToClipboard(code);
    console.log(chalk["green"]("Text copied to clipboard"));
  }

  private async chatCompletion(prompt: string) {
    if (prompt === "") return new Promise((resolve) => resolve(this.run()));

    const input: Option = prompt.split(" ")[0] as Option;
    const arg: string = prompt.split(" ").slice(1).join(" ");

    switch (input) {
      case "exit":
        process.exit(0);
      case "clear":
        console.clear();
        return new Promise((resolve) => resolve(this.run()));
      case "help":
        this.showHelp();
        return new Promise((resolve) => resolve(this.run()));
      case "cat":
        await this.cat(arg);
        return new Promise((resolve) => resolve(this.run()));
      case "copy":
        await this.copy();
        return new Promise((resolve) => resolve(this.run()));
      case "save":
        console.log(chalk["yellow"].italic("Saving..."));
        const saveMessage = await this.getCodeFromLastMessage();
        const {
          code: snippet,
          language,
          snippetName,
          fileExtension,
        } = JSON.parse(saveMessage);

        this.saveSnippet({
          snippet,
          snippetName,
          fileExtension,
          language,
        });
        return new Promise((resolve) => resolve(this.run()));

      case "snippet":
        const name = arg;
        this.showSnippet(name);
        return new Promise((resolve) => resolve(this.run()));

      case "snippets":
        this.showSnippets();
        return new Promise((resolve) => resolve(this.run()));

      default:
        if (input === "debug") {
          console.log(chalk["yellow"].italic("Debugging..."));
          const response = await this.debugFile(arg);
          if (typeof response === "string") {
            prompt = response;
          } else {
            return new Promise((resolve) => resolve(this.run()));
          }
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
