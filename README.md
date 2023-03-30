> Disclaimer:

> 1- Starting from this message and including the code, almost everything written in this program was written by ChatGPT-4. So please keep this in mind if you are crazy enough to run and use this.

> 2- It's quite expensive and addictive; the price adds up quickly.

# J.A.R.V.I.S - ChatGPT doing bash stuff in your terminal



https://user-images.githubusercontent.com/11483241/228049822-23015ea6-9c3d-4196-b031-f27b6067eae6.mp4


J.A.R.V.I.S (Just A Rather Very Intelligent System) is a project inspired by the Marvel character, which allows you to have an interactive conversation with the OpenAI API. The main script (`main.js`) is written in Deno and reads commands from the user, sending them to the OpenAI API. It displays the response and can even execute shell (bash) commands if the user approves.

## Requirements

- Deno (https://deno.land/)
- Access to the OpenAI API service (you need to create a .env file with the key)

## How to run

1. Make sure Deno is installed and working properly on your computer.
2. Create a .env file in the root of this project with the following variables:

```
API_KEY=&lt;your_openai_api_key&gt;
API_URL=https://api.openai.com/v1/engines/davinci-codex/completions
MODEL_DUMP=&lt;dump_model_name&gt;
MODEL_SMART=&lt;smart_model_name&gt;
```

3. You can update the setup_prompt to handle your own commands.

4. Follow the instructions below to create an executable and add it to your PATH:

### Create an executable

- Create a file called `jarvis` (no extension) with the following content:

```
#!/bin/sh
deno run --allow-net --allow-run --allow-read --allow-write --unstable /absolute/path/to/main.js "$@"
```

Remember to replace `/absolute/path/to/` with the absolute path to the folder where the main.js file is located.

- Make the `jarvis` file executable with the following command:

```
chmod +x jarvis
```

### Add executable to PATH

- Open your shell configuration file (usually it's the `.bashrc`, `.bash_profile`, or `.zshrc`) and add the following line at the end of the file:

```
export PATH="/absolute/path/to/folder:$PATH"
```

Replace `/absolute/path/to/folder/` again with the absolute path to the folder where the `jarvis` file is located. Save the file and restart your terminal.

4. After adding the executable to PATH, you can run the script by simply typing `jarvis` in the terminal, followed by the flags `-d` to use the `MODEL_DUMP` model or `-s` to use the `MODEL_SMART` model. If no flag is provided, the `MODEL_SMART` model will be used by default.

Example:

```
jarvis -d
```

## Notes

The script allows you to execute shell (bash) commands if the user approves. Be careful when running commands on your system, as they may alter important files and settings. Make sure you fully understand the effect of a command before executing it.
