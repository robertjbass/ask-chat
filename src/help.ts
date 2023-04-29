import chalk from "chalk";

const chalkTemplate = (strings: any, ...keys: any) => {
  const output = strings.reduce((acc: string, str: string, i: number) => {
    const key = keys[i] ? keys[i] : "";
    return acc + str + key;
  }, "");

  return chalk(output);
};

const createCenteredString = (word: string, width?: number) => {
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

enum Option {
  Exit = "exit",
  Clear = "clear",
  Help = "help",
  Snippets = "snippets",
  Snippet = "snippet",
  Copy = "copy",
}

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
const section = (text: string) => {
  const centeredText = createCenteredString(text);
  const bgColor = "bgCyan";
  const textColor = "black";
  return chalk[bgColor][textColor].bold(centeredText);
};

export const help = chalkTemplate`
${section("OPTIONS")}

${option(Option.Exit)}
${description("exit the program")}

${option(Option.Clear)}
${description("clear the terminal")}

${option(Option.Help)}
${description("show this help menu")}

${option(Option.Snippets)}
${description("show a list of snippets")}

${option(Option.Snippet)}
${description("show snippet - snippet <name>")}

${option(Option.Copy)}
${description("copy the last code snippet to the clipboard")}

${section("https://github.com/robertjbass")}
`;

export const helpMenu = () => console.log(help);
