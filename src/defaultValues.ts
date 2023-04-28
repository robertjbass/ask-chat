import path from "path";
export const defaultSystemPrompt = `You are an assistant that helps software developers get information from their terminal.`;
export const help = `
exit: exit the program
clear: clear the terminal
help: show this help menu
snippets: show a list of snippets
snippet: show a snippet
copy: copy the last code snippet to the clipboard`;
export const createSnippet = `
Your job is to look at some text and extract the code from it. You will return only JSON in the following format:
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

If there is no code found in the prompt, you will return the following format, you will handle it like this:
{"code": "<FULL RESPONSE>","language": "Text","snippetName": "<1 TO 2 WORD SUMMARY>","fileExtension": "txt"}

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
`;

export const defaultSnippetFolder = path.resolve(
  `${process.env.HOME}`,
  "gpt-snippets"
);

export const defaultConfig = {
  apiKey: "",
  snippetFolder: defaultSnippetFolder,
  responseColor: "green",
  userNameColor: "blue",
  systemPrompt: defaultSystemPrompt,
  userName: process.env.USER || "User",
};
