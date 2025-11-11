import OpenAI from 'openai'
import chalk from 'chalk'
import readline from 'readline'
import fs from 'fs'
import { highlight } from 'cli-highlight'
import { defaultConfig } from '@/default-values'
import { helpMenu } from '@/help'
import { ChatMessage, Config, Option } from '@/types'
import { errors, sanitizeImportName, statuses } from '@/utils'
import clipboardy from 'clipboardy'
import { generateFileTree, printFileTreeString } from '@/crawl'

// (async () => {
//   const fileTree = await generateFileTree();
//   console.log(`\n${printFileTree(fileTree, "object")}`);
//   console.log(`\n${printFileTree(fileTree, "string")}`);
// })();

export class OpenAiClient {
  private openai: OpenAI
  private messages: ChatMessage[]
  private config: Config = defaultConfig
  private activeDirectory: string

  constructor(config: Config) {
    this.activeDirectory = process.cwd()
    this.config = config
    this.pwd()
    this.messages = [{ role: 'system', content: this.config?.systemPrompt }]
    this.openai = new OpenAI({ apiKey: this.config.apiKey })
  }

  private showHelp() {
    helpMenu();
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
      return null;
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

  private async debugFile(fPath: string, information: string = "") {
    if (fPath === "") return null; // new Promise((resolve) => resolve(this.run()));

    let tempFile = "";
    const file = this.readFile(fPath);
    if (!file) return null; // new Promise((resolve) => resolve(this.run()));

    const fileLines = file?.split("\n");
    const fileTree = await generateFileTree();
    const fileLineStrings = printFileTreeString(fileTree).split("\n");

    for (const line of fileLines) {
      const isImportLine =
        (line?.includes("import ") && line.includes(" from ")) ||
        line?.includes("require(");

      if (!isImportLine) return (tempFile += line + "\n");

      const importName = sanitizeImportName(
        line?.split("from")?.pop() || line?.split("require(")?.pop() || ""
      );

      const isLocalImport =
        importName.includes(".") || importName.includes("/");

      if (!isLocalImport) return (tempFile += line + "\n");

      const fileName = importName.split("/").pop() || "";
      if (!fileName) return (tempFile += line + "\n");

      const filePath = fileLineStrings.find((fileLine: string) => {
        const segments = fileLine.split("/");
        const name = segments[segments.length - 1].split(".")[0];
        const fileNameWithoutExtension = fileName.split(".")[0];
        return name === fileNameWithoutExtension;
      });
      if (!filePath) return (tempFile += line + "\n");

      try {
        const fileContent = this.readFile(filePath);
        return (tempFile += fileContent + "\n");
      } catch {
        return (tempFile += line + "\n");
      }
    }

    try {
      console.log(highlight(file, { language: fPath.split(".")[1] }));
    } catch {
      console.log(errors.syntaxHighlightingUnavailable());
    }

    const prefix = !information
      ? "Find the bug(s) in this file:"
      : "I need help with this code:";

    return `${prefix}\n${tempFile || file}\n\n//${information}`;
  }

  private async copy() {
    try {
      const lastMessage = this.messages[this.messages.length - 1].content;
      await clipboardy.write(lastMessage);
      console.log(statuses.success("Response copied to clipboard"));
    } catch (error) {
      console.error(chalk.red("Failed to copy to clipboard:", error));
    }
  }

  private async prompt(prompt: string): Promise<void> {
    if (prompt === "") {
      await this.run();
      return;
    }
    if (prompt === "exit") process.exit(0);

    const input: Option = prompt.split(" ")[0] as Option;
    const arg: string = prompt.split(" ").slice(1).join(" ");

    switch (input) {
      case "clear":
        console.clear();
        await this.run();
        return;
      case "help":
        this.showHelp();
        await this.run();
        return;
      case "cat":
        await this.cat(arg);
        await this.run();
        return;
      case "copy":
        await this.copy();
        await this.run();
        return;
      case "pwd":
        this.pwd();
        await this.run();
        return;
      default:
        if (input === "debug") {
          console.log(statuses.loading("Debugging..."));
          const filePath = arg.split(" ")[0];
          const information = arg.split(" ")?.slice(1)?.join(" ") || "";
          const response = await this.debugFile(filePath, information);

          if (typeof response !== "string" || !response) {
            await this.run();
            return;
          }
          prompt = response;
        }
        await this.chatCompletion(prompt);
    }
  }

  private async chatCompletion(prompt: string): Promise<void> {
    try {
      this.messages.push({ role: "user", content: prompt });
      const stream = await this.openai.chat.completions.create({
        messages: this.messages,
        model: "gpt-5",
        stream: true,
      });

      let resultText = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          resultText += content;
          const responseColor = this.config?.responseColor || "green";
          process.stdout.write(chalk[responseColor](content));
        }
      }

      this.addAssistantMessage(resultText);
      await this.run();
    } catch (error: any) {
      this.handleError(error);
      await this.run();
    }
  }

  private handleError(error: any) {
    console.log("\n");

    // Handle OpenAI API errors
    if (error?.status && error?.error) {
      const { status, error: apiError } = error;

      // Display clean error header
      console.log(chalk.red.bold(`\n━━━ OpenAI API Error (${status}) ━━━\n`));

      // Display the main error message
      console.log(chalk.yellow(apiError.message));

      // Add helpful context for common errors
      if (apiError.code === 'unsupported_value' && apiError.param === 'stream') {
        console.log(chalk.dim('\nNote: This error typically occurs when your organization needs verification.'));
        console.log(chalk.dim('Verification can take up to 15 minutes to propagate.\n'));
      } else if (status === 401) {
        console.log(chalk.dim('\nPlease check your API key in ~/.gpterminal.json\n'));
      } else if (status === 429) {
        console.log(chalk.dim('\nYou have exceeded your rate limit or quota.\n'));
      }

      console.log(chalk.red.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    } else {
      // Generic error
      console.log(chalk.red.bold('\n━━━ Error ━━━\n'));
      console.log(chalk.yellow(error?.message || 'An unexpected error occurred'));
      console.log(chalk.red.bold('\n━━━━━━━━━━━━━\n'));
    }
  }

  private addAssistantMessage(content: string) {
    this.messages.push({ role: "assistant", content });
  }

  private promptUser() {
    const userNameColor = this.config?.userNameColor || "blue";
    process.stdout.write(`\n\n${chalk[userNameColor].bold(this.config.userName)}: `);
  }

  public async run(): Promise<void> {
    this.promptUser()

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    return new Promise<void>((resolve) => {
      rl.once('line', async (line: string) => {
        rl.close()
        rl.removeAllListeners()
        await this.prompt(line.trim())
        resolve()
      })
    })
  }
}
