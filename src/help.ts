import chalk from "chalk";
import { Option } from "./types.js";

const chalkTemplate = (strings: any, ...keys: any) => {
  const output = strings.reduce((acc: string, str: string, i: number) => {
    const key = keys[i] ? keys[i] : "";
    return acc + str + key;
  }, "");

  return chalk(output);
};

export const createCenteredString = (word: string, width?: number) => {
  const columns = width ? width : process.stdout.columns;
  const wordLength = word.length;
  const leftPadding = Math.floor((columns - wordLength) / 2);
  const rightPadding = columns - wordLength - leftPadding;

  const leftSpaces = " ".repeat(leftPadding);
  const rightSpaces = " ".repeat(rightPadding);

  return leftSpaces + word + rightSpaces;
};

const longestOptionLength = (enumObject: any) => {
  let maxLength = 0;

  for (const key in enumObject) {
    if (enumObject.hasOwnProperty(key)) {
      const optionLength = enumObject[key].length;
      maxLength = Math.max(maxLength, optionLength);
    }
  }

  return maxLength;
};

const optionLength = longestOptionLength(Option);

const padRight = (text: string, length: number) => {
  const spaces = " ".repeat(length - text.length);
  return `${text} ${spaces}`;
};

const option = (option: Option) => {
  const bgColor = "bgCyan";
  const textColor = "blue";
  const output = padRight(option, optionLength);
  return chalk[bgColor][textColor].bold(` ${output}`);
};
const description = (description: string) => {
  const textColor = "cyan";
  return chalk[textColor](description);
};
const example = (example: string) => {
  const textColor = "magenta";
  return chalk[textColor](example);
};
const section = (text: string) => {
  const centeredText = createCenteredString(text);
  const bgColor = "bgCyan";
  const textColor = "black";
  return chalk[bgColor][textColor].bold(centeredText);
};

const demoAbsoluteFilePath = "/Users/bob/dev/ask-chat/lib/openAiClient.js";
const demoRelativePath = "./openAiClient.js";

export const help = chalkTemplate`
${section("OPTIONS")}

${option(Option.Save)}
${description("save most recent code snippet or response")}

${option(Option.Snippets)}
${description("show a list of snippets")}

${option(Option.Snippet)}
${description("show snippet - snippet <name or number>")}
${description("snippet fizzbuzz || snippet 1")}

${option(Option.Debug)}
${description("debug file - debug <file path>")}
${example(`debug ${demoAbsoluteFilePath}`)} ${chalk["gray"]("# absolute path")}
${example(`debug ${demoRelativePath}`)} ${chalk["gray"]("# relative path")}

${option(Option.Cat)}
${description("show file with syntax highlighting - cat <file path>")}
${example(`cat ${demoAbsoluteFilePath}`)} ${chalk["gray"]("# absolute path")}
${example(`cat ${demoRelativePath}`)} ${chalk["gray"]("# relative path")}

${option(Option.Copy)}
${description("copy the code snippets from the last response to clipboard")}

${option(Option.Clear)}
${description("clear the terminal")}

${option(Option.Exit)}
${description("exit the program")}

${option(Option.Help)}
${description("show this help menu")}

${section("https://github.com/robertjbass")}
`;

export const helpMenu = () => console.log(help);
