import { Configuration, OpenAIApi } from "openai";
import chalk from "chalk";
import readline from "readline";
import fs from "fs";
import os from "os";
import { highlight } from "cli-highlight";
import { createSnippet, defaultConfig } from "./defaultValues.js";
import { helpMenu } from "./help.js";
import { ChatMessage, Config, Option } from "./types.js";
import { TextDecoder } from "util";
import { display, errors, sanitize, statuses } from "./utils.js";
import clipboardy from "clipboardy";
const decoder = new TextDecoder("utf-8");

export class OpenAiClient {
  private openai: OpenAIApi;
  private messages: ChatMessage[];
  private config: Config = defaultConfig;
  private activeDirectory: string;
  private platform: NodeJS.Platform;

  constructor(config: Config) {
    this.platform = os.platform();
    this.activeDirectory = process.cwd();
    this.config = config;
    this.pwd();
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
        const error = errors.snippetDoesntExist(
          snippetNameAsNumber,
          snippets.length
        );
        console.log(error);
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

    try {
      const filePath = `${this.config.snippetFolder}/${snippetName}`;
      const snippet = fs.readFileSync(filePath, "utf8");
      console.log(display.snippet(snippet, filePath));
    } catch {
      console.log(errors.snippetDoesntExist(snippetName));
    }
  }

  private showSnippets() {
    const snippets = fs.readdirSync(this.config.snippetFolder);
    console.log(display.heading("SNIPPETS"));
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
      filePath = `${this.activeDirectory}/${filePath}`;
    }

    try {
      const file = fs.readFileSync(filePath, "utf8");
      return file;
    } catch {
      console.log(errors.fileDoesntExist(filePath));
    }
  }

  private pwd() {
    console.log(statuses.directory(this.activeDirectory));
  }

  private cat(fPath: string) {
    if (fPath === "") return new Promise((resolve) => resolve(this.run()));

    const file = this.readFile(fPath);
    if (!file) return new Promise((resolve) => resolve(this.run()));
    try {
      console.log(highlight(file, { language: fPath.split(".")[1] }));
    } catch {
      console.log(errors.syntaxHighlightingUnavailable());
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
      console.log(errors.syntaxHighlightingUnavailable());
    }
    return `Find the bug(s) in this file:\n${file}`;
  }

  private async copy() {
    console.log(statuses.loading("Copying..."));
    const message = await this.getCodeFromLastMessage();
    const { code } = JSON.parse(message);

    try {
      await clipboardy.write(code);
    } catch (error) {
      console.error("Failed to copy text to clipboard:", error);
    }

    console.log(statuses.success("Text copied to clipboard"));
  }

  private async save(savePath?: string) {
    console.log(statuses.loading(`Saving ${savePath ? "File" : "Snippet"}...`));
    const saveMessage = await this.getCodeFromLastMessage();
    const {
      code: snippet,
      language,
      snippetName,
      fileExtension,
    } = JSON.parse(saveMessage);

    let baseFolder = !!savePath ? savePath : this.config.snippetFolder;
    let fileName = `${snippetName}.${fileExtension}`;

    if (!!savePath && savePath.split(".").length > 1) {
      baseFolder = savePath.split("/").slice(0, -1).join("/");
      fileName = savePath.split("/").slice(-1)[0];
    }

    const filePath = `${baseFolder}/${fileName}`;

    if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);
    fs.writeFileSync(filePath, snippet);

    console.log(statuses.success(`Saved ${language} file at ${filePath}`));
  }

  private async chatCompletion(prompt: string) {
    if (prompt === "") return new Promise((resolve) => resolve(this.run()));
    if (prompt === "exit") process.exit(0);

    const input: Option = prompt.split(" ")[0] as Option;
    const arg: string = prompt.split(" ").slice(1).join(" ");

    if (input === "save" && !!arg) {
      await this.save(arg);
      return new Promise((resolve) => resolve(this.run()));
    }

    switch (input) {
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
      case "pwd":
        this.pwd();
        return new Promise((resolve) => resolve(this.run()));
      case "save":
        await this.save();
        return new Promise((resolve) => resolve(this.run()));
      case "snippet":
        this.showSnippet(arg);
        return new Promise((resolve) => resolve(this.run()));
      case "snippets":
        this.showSnippets();
        return new Promise((resolve) => resolve(this.run()));
      default:
        if (input === "debug") {
          console.log(statuses.loading("Debugging..."));
          const response = await this.debugFile(arg);

          if (typeof response !== "string") {
            return new Promise((resolve) => resolve(this.run()));
          }
          prompt = response;
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

  private promptUser() {
    const userNameColor = this.config?.userNameColor || "blue";
    const prompt = `\n\n${chalk[userNameColor].bold(this.config.userName)}: `;
    process.stdout.write(prompt);
  }

  public async run() {
    this.promptUser();
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
