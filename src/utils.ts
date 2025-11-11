import highlight from 'cli-highlight'
import { ChalkColor } from '@/types'
import { createCenteredString } from '@/help'
import chalk from 'chalk'

// Type helper for chalk color access
function getChalkColor(color: ChalkColor) {
  return (chalk as any)[color] as typeof chalk;
}

export function sanitize(name: string) {
  return name
    .toLowerCase()
    .split(" ")
    .join("")
    .split("-")
    .join("")
    .split("_")
    .join("");
}

export const errors = {
  fileDoesntExist(filePath: string) {
    const textColor: ChalkColor = "red";
    return getChalkColor(textColor)(`File ${filePath} does not exist`);
  },
  syntaxHighlightingUnavailable() {
    const textColor: ChalkColor = "red";
    return getChalkColor(textColor)(`No syntax highlighting for this file type\n\n`);
  },
};

export const statuses = {
  loading(message: string, color: ChalkColor = "yellow") {
    return getChalkColor(color).italic(message);
  },
  success(message: string, color: ChalkColor = "green") {
    return getChalkColor(color)(message);
  },
  info(message: string, prefix: string = "", color: ChalkColor = "blue") {
    return `${prefix}${getChalkColor(color)(message)}`;
  },
  directory(directory: string, color: ChalkColor = "blue") {
    return `${chalk.blue.bold("Active Directory:")} ${getChalkColor(color)(
      directory
    )}`;
  },
};

export const display = {
  heading(text: string) {
    const bgColor: ChalkColor = "bgCyan";
    const textColor: ChalkColor = "blue";
    const heading = createCenteredString(text);
    return `\n${getChalkColor(bgColor)[textColor].bold(heading)}\n`;
  },
  code(code: string, filePath: string) {
    const bgColor: ChalkColor = "bgCyan";
    const textColor: ChalkColor = "blue";
    const heading = createCenteredString(filePath);

    return [
      `\n${getChalkColor(bgColor)[textColor].bold(heading)}`,
      `${code}\n`,
    ].join("\n\n");
  },
};

export function sanitizeImportName(importName: string) {
  return importName
    .split("'")
    .join("")
    .split('"')
    .join("")
    .split(" ")
    .join("")
    .split(";")
    .join("")
    .trim();
}
