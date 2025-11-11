# Ask-Chat CLI

> ChatGPT in your terminal - powered by GPT-5

A lightning-fast CLI tool that brings the power of ChatGPT directly to your command line. Debug code, get instant answers, and boost your productivity without leaving the terminal.

## Features

- 🤖 **GPT-5 Powered** - Latest OpenAI model for superior responses
- 🔍 **Code Debugging** - Analyze files for bugs with AI assistance
- 📋 **Clipboard Integration** - Copy responses instantly
- 🎨 **Syntax Highlighting** - Beautiful code display
- 💬 **Conversational Memory** - Context-aware throughout your session
- ⚡ **Streaming Responses** - Real-time AI responses

## Quick Start

### Requirements
- Node.js >= 18.0.0
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- pnpm >= 8.0.0 (recommended) or npm

### Installation

**Using pnpm (recommended):**
```bash
pnpx ask-chat
```

**Using npm:**
```bash
npx ask-chat
```

On first run, you'll be prompted for your OpenAI API key. It will be securely stored in `~/.gpterminal.json`.

## Usage

### Basic Chat

Simply start typing to chat with GPT-5:

````txt
bob: How do I write fizzbuzz in python?


Here's how you can write the fizzbuzz program in Python:


```python
for num in range(1, 101):
    divisible_by_three = (num % 3 == 0)
    divisible_by_five = (num % 5 == 0)

    if divisible_by_three and divisible_by_five:
        print("FizzBuzz")
    elif divisible_by_three:
        print("Fizz")
    elif divisible_by_five:
        print("Buzz")
    else:
        print(num)
```


In this program, we iterate over the numbers 1 to 100 using a `for` loop. For each number, we check if it is divisible by 3, 5, or both using the modulo operator (`%`).

If the number is divisible by both 3 and 5, we print "FizzBuzz". If it is divisible by 3, we print "Fizz". If it is divisible by 5, we print "Buzz". And if it is not divisible by either 3 or 5, we simply print the number itself.
````

## Available Commands

### debug
Analyze a file for bugs and get AI-powered debugging help:
```bash
debug ./myfile.js
debug /absolute/path/to/file.py
```

### cat
Display a file with beautiful syntax highlighting:
```bash
cat ./myfile.js
```

### copy
Copy the last AI response to your clipboard:
```bash
copy
```

### pwd
Show your current working directory:
```bash
pwd
```

### Other Commands
```bash
help    # Show all available commands
clear   # Clear the terminal
exit    # Exit the program
```

## Configuration

Your configuration is stored in `~/.gpterminal.json`. You can manually edit this file to:
- Change your API key
- Customize response colors
- Modify the username display
- Adjust the system prompt

Example configuration:
```json
{
  "apiKey": "sk-...",
  "responseColor": "green",
  "userNameColor": "blue",
  "systemPrompt": "You are an assistant that helps software developers.",
  "userName": "YourName"
}
```

## Development

### Setup
```bash
git clone https://github.com/robertjbass/ask-chat.git
cd ask-chat
pnpm install
```

### Build
```bash
pnpm run build
```

### Development Mode
Run with hot-reload using tsx:
```bash
pnpm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## Issues & Support

If you encounter any problems or have suggestions, please [open an issue](https://github.com/robertjbass/ask-chat/issues).

## License

This project is licensed under the ISC License.

## Author

**Bob Bass**
- GitHub: [@robertjbass](https://github.com/robertjbass)

---

Made with ❤️ for developers who live in the terminal
