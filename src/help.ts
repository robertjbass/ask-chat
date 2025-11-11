import chalk from 'chalk'
import { Option } from '@/types'

function chalkTemplate(strings: any, ...keys: any) {
  const output = strings.reduce((acc: string, str: string, i: number) => {
    const key = keys[i] ? keys[i] : "";
    return acc + str + key;
  }, "");

  return chalk(output);
}

export function createCenteredString(word: string, width?: number) {
  const columns = width ? width : process.stdout.columns;
  const wordLength = word.length;
  const leftPadding = Math.floor((columns - wordLength) / 2);
  const rightPadding = columns - wordLength - leftPadding;

  const leftSpaces = " ".repeat(leftPadding);
  const rightSpaces = " ".repeat(rightPadding);

  return leftSpaces + word + rightSpaces;
}

function longestOptionLength(enumObject: any) {
  let maxLength = 0;

  for (const key in enumObject) {
    if (enumObject.hasOwnProperty(key)) {
      const optionLength = enumObject[key].length;
      maxLength = Math.max(maxLength, optionLength);
    }
  }

  return maxLength;
}

const optionLength = longestOptionLength(Option);

function padRight(text: string, length: number) {
  const spaces = " ".repeat(length - text.length);
  return `${text} ${spaces}`;
}

function option(optionValue: Option) {
  const output = padRight(optionValue, optionLength);
  return chalk.cyan.bold(`  ${output}`);
}

function description(description: string) {
  const textColor = "cyan";
  return chalk[textColor](description);
}

function example(example: string) {
  const textColor = "magenta";
  return chalk[textColor](example);
}

function section(text: string) {
  const centeredText = createCenteredString(text);
  return chalk.cyan.bold(centeredText);
}

const demoAbsoluteFilePath = "/Users/bob/dev/ask-chat/lib/openAiClient.js";
const demoRelativePath = "./openAiClient.js";

export const help = chalkTemplate`
${chalk.cyan.bold("\n════════════════════ COMMANDS ════════════════════\n")}
${option(Option.DEBUG)}    ${description("Debug a file - analyze code for bugs")}
                    ${example(`debug ${demoRelativePath}`)}

${option(Option.CAT)}      ${description("Display file with syntax highlighting")}
                    ${example(`cat ${demoRelativePath}`)}

${option(Option.COPY)}     ${description("Copy last response to clipboard")}

${option(Option.PWD)}      ${description("Show current working directory")}

${option(Option.CLEAR)}    ${description("Clear the terminal")}

${option(Option.EXIT)}     ${description("Exit the program")}

${option(Option.HELP)}     ${description("Show this help menu")}
${chalk.cyan.bold("\n══════════════════════════════════════════════════")}
${chalk.gray("  github.com/robertjbass/ask-chat")}
`;

export function helpMenu() {
  console.log(help);
}
