import readline from "readline";
import fs from "fs";
import { Config } from "./types.js";
import { defaultConfig } from "./defaultValues.js";
import { OpenAiClient } from "./openAiClient.js";
import chalk from "chalk";

export const init = async () => {
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
      terminal: false,
    });

    await new Promise((resolve, _reject) => {
      rl.question("Enter your OpenAI API key: ", (answer) => {
        const config: Config = { ...defaultConfig, apiKey: answer };
        console.clear();
        fs.writeFileSync(configFileLocation, JSON.stringify(config));
        return resolve(config);
      });
    });
    await init();
  } else {
    const greetingText = `Type ${chalk["magenta"].bold(
      "'help'"
    )} for options ${chalk["yellow"].italic("or")} ${chalk["magenta"].bold(
      "start chatting"
    )}`;
    console.log(greetingText);
    const openAiClient = new OpenAiClient(config);
    await openAiClient.run();
  }
};
