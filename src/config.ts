import readline from 'readline'
import fs from 'fs'
import { Config } from '@/types'
import { defaultConfig } from '@/default-values'
import { OpenAiClient } from '@/openai-client'
import chalk from 'chalk'

export async function init() {
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
    });

    await new Promise((resolve, _reject) => {
      process.stdout.write("Enter your OpenAI API key: ");

      // Hide input
      if (process.stdin.isTTY) {
        (process.stdin as any).setRawMode(true);
      }

      let apiKey = "";

      process.stdin.on("data", (char) => {
        const byte = char.toString();

        if (byte === "\n" || byte === "\r" || byte === "\u0004") {
          // Enter or Ctrl+D pressed
          if (process.stdin.isTTY) {
            (process.stdin as any).setRawMode(false);
          }
          process.stdin.pause();
          process.stdout.write("\n");

          const config: Config = { ...defaultConfig, apiKey: apiKey.trim() };
          console.clear();
          fs.writeFileSync(configFileLocation, JSON.stringify(config));
          rl.close();
          return resolve(config);
        } else if (byte === "\u0003") {
          // Ctrl+C pressed
          process.exit(0);
        } else if (byte === "\u007f" || byte === "\b") {
          // Backspace pressed
          if (apiKey.length > 0) {
            apiKey = apiKey.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else if (byte >= " " && byte <= "~") {
          // Printable character
          apiKey += byte;
          process.stdout.write("*");
        }
      });
    });
    await init();
  } else {
    console.clear();
    console.log(
      chalk.cyan.bold("\n╔═══════════════════════════════════════════╗")
    );
    console.log(
      chalk.cyan.bold("║") +
        chalk.white.bold("        Ask-Chat CLI - GPT-5 Powered       ") +
        chalk.cyan.bold("║")
    );
    console.log(
      chalk.cyan.bold("╚═══════════════════════════════════════════╝")
    );
    console.log(
      chalk.gray("\nType") +
        chalk.magenta.bold(" help ") +
        chalk.gray("for commands or") +
        chalk.magenta.bold(" start chatting\n")
    );

    const openAiClient = new OpenAiClient(config);
    await openAiClient.run();
  }
}
