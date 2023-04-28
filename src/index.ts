import { Configuration, OpenAIApi } from "openai";
import readline from "readline";
import "dotenv/config";
import chalk from "chalk";
import fs from "fs";

const decoder = new TextDecoder("utf-8");
const responseColor = "green";
const userNameColor = "blue";
const snippetFolder = "./snippets";

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

  private async getCodeFromLastMessage() {
    const { data }: any = await this.openai.createChatCompletion({
      messages: [
        {
          role: "system",
          content: `Your job is to look at some text and extract the code from it. You will return only JSON in the following format:
{
  "code": <EXTRACTED CODE>,
  "language": <LANGUAGE OF CODE>
  "snippetName": <NAME OF SNIPPET>,
  "fileExtension": <FILE EXTENSION>,
}

Do not return it as a string, but as a JSON object. No text should be returned, only the stringified JSON object.
Do not say anything else, just return the stringified JSON object.

Good Example (DO THIS):
'{"code": "console.log('Hello World!')","language": "JavaScript","snippetName": "Hello World","fileExtension": "js"}'

Bad Example (DO NOT DO THIS):
Here is the JSON object for the Python code snippet:

\`\`\`
{
  "code": "print(\"Hello, World!\")",
  "language": "Python",
  "snippetName": "Hello World",
  "fileExtension": "py"
}
\`\`\`

Do not add a '.' to the fileExtension. Do not add a newline at the end of the JSON object. Do not add any other text.
file names should be in camelCase, PascalCase, or snakeCase depending on the language. Do not use kebab-case. Do not use spaces in filenames
`,
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
      console.log(
        "exit: exit the program\n" +
          "clear: clear the terminal\n" +
          "help: show this help menu\n" +
          "snippets: show a list of snippets\n" +
          "snippet: show a snippet"
      );
      return new Promise((resolve) => resolve(this.run()));
    } else if (prompt === "save") {
      const message = await this.getCodeFromLastMessage();
      const { code, language, snippetName, fileExtension } =
        JSON.parse(message);
      console.log({ code, language, snippetName, fileExtension });

      const fileName = `${snippetName}.${fileExtension}`;
      const snippet = code;

      console.log(`Saving ${language} snippet ${fileName}`);
      fs.writeFileSync(`${snippetFolder}/${fileName}`, snippet);

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
