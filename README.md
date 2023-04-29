# Ask-Chat CLI Tool

The Ask-Chat CLI tool allows you to interact with a chat client using the command line interface. It also provides a variety of helpful commands for developers.

## Getting Started

To start the tool, simply run the command `npx ask-chat` in your terminal.

## Usage

The `ask-chat` interactive terminal is effectively `chat gpt` with many custom commands and access to your filesystem. It will not read anything that you do not ask it to read, and it will not delete or modify files.

You can immediately start chatting:

```bash
bob: How do I write fizzbuzz in python?


Here's how you can write the fizzbuzz program in Python:
```

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

```bash
In this program, we iterate over the numbers 1 to 100 using a `for` loop. For each number, we check if it is divisible by 3, 5, or both using the modulo operator (`%`).

If the number is divisible by both 3 and 5, we print "FizzBuzz". If it is divisible by 3, we print "Fizz". If it is divisible by 5, we print "Buzz". And if it is not divisible by either 3 or 5, we simply print the number itself.
```

## snippets

save most recent code snippet from response

```bash
save
```

or you may copy it to the clipboard

```bash
copy
```

show a list of snippets

```bash
snippets

# 1 FizzBuzz.py
# 2 RecursiveCountdown.py
# 3 factorial.py
```

show snippet by name

```bash
snippet fizzbuzz
```

or by list order

```bash
snippet 1
```

### debug

Debug a local file with chat-gpt

```bash
# absolute path
debug /Users/bob/dev/ask-chat/lib/openAiClient.js

# relative path
debug ./openAiClient.js
```

### cat

Show file with syntax highlighting

```bash
# absolute
cat /Users/bob/dev/ask-chat/lib/openAiClient.js

# relative
cat ./openAiClient.js
```

### other

```bash
# clear terminal window
clear

# exit the app
exit

# show the help menu with options
help
```

## Contributing

If you'd like to contribute to the Ask-Chat CLI tool or report any issues, please visit the [GitHub repository](https://github.com/robertjbass/ask-chat).

## License

The Ask-Chat CLI tool is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
