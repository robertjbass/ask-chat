import highlight from "cli-highlight";
import { ChalkColor } from "./types";
import { createCenteredString } from "./help.js";
import chalk from "chalk";

export const sanitize = (name: string) => {
  return name
    .toLowerCase()
    .split(" ")
    .join("")
    .split("-")
    .join("")
    .split("_")
    .join("");
};

export const errors = {
  fileDoesntExist: (filePath: string) => {
    const textColor: ChalkColor = "red";
    return chalk[textColor](`File ${filePath} does not exist`);
  },
  syntaxHighlightingUnavailable: () => {
    const textColor: ChalkColor = "red";
    return chalk[textColor](`No syntax highlighting for this file type\n\n`);
  },
  snippetDoesntExist: (snippetName: number | string, snippetCount?: number) => {
    const isNumber = typeof snippetName === "number";
    const headingColor: ChalkColor = "red";
    const warningColor: ChalkColor = "yellow";
    const heading = `\n${chalk[headingColor].bold(
      `Snippet ${snippetName} does not exist`
    )}`;
    const body = [
      `${chalk[warningColor]("Please enter")}`,
      isNumber && `${chalk[warningColor](`'snippet <1-${snippetCount}>'`)}`,
      isNumber && `${chalk["blue"].italic("or")}`,
      `${chalk[warningColor]("'snippets' for a list")}`,
    ]
      .filter(Boolean)
      .join(" ");

    return `\n${heading}\n${body}\n`;
  },
};

export const statuses = {
  loading: (message: string, color: ChalkColor = "yellow") => {
    return chalk[color].italic(message);
  },
  success: (message: string, color: ChalkColor = "green") => {
    return chalk[color](message);
  },
  info: (message: string, prefix: string = "", color: ChalkColor = "blue") => {
    return `${prefix}${chalk[color](message)}`;
  },
  directory: (directory: string, color: ChalkColor = "blue") => {
    return `${chalk["blue"].bold("Active Directory:")} ${chalk[color](
      directory
    )}`;
  },
};

export const display = {
  heading: (text: string) => {
    const bgColor: ChalkColor = "bgCyan";
    const textColor: ChalkColor = "blue";
    const heading = createCenteredString(text);
    return `\n${chalk[bgColor][textColor].bold(heading)}\n`;
  },
  snippet: (snippet: string, filePath: string) => {
    const bgColor: ChalkColor = "bgCyan";
    const textColor: ChalkColor = "blue";
    const heading = createCenteredString(filePath);

    return [
      `\n${chalk[bgColor][textColor].bold(heading)}`,
      `${snippet}\n`,
    ].join("\n\n");
  },
};
