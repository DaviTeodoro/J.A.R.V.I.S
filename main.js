#!/usr/bin/env -S deno run --allow-net --allow-run --allow-read --allow-write --unstable
import { config } from 'https://deno.land/x/dotenv/mod.ts';
import { parse } from 'https://deno.land/std/flags/mod.ts';

function selectModel() {
  const args = parse(Deno.args);

  if (args.d) {
    return MODEL_DUMP;
  } else if (args.s) {
    return MODEL_SMART;
  } else {
    return MODEL_SMART; // Use o modelo SMART como padrão
  }
}

const env = config();

const API_KEY = env.API_KEY;
const API_URL = env.API_URL;
const MODEL_DUMP = env.MODEL_DUMP;
const MODEL_SMART = env.MODEL_SMART;

async function readSetupPrompt() {
  const data = await Deno.readTextFile('setup_prompt.txt');
  return data;
}

async function fetchFromOpenAI(prompt, model) {
  console.log('Fetching from OpenAI...', prompt);
  const requestData = {
    model: model,
    messages: prompt,
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(requestData),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function executeBash(command) {
  const process = Deno.run({
    cmd: ['bash', '-c', command],
    stdout: 'piped',
    stderr: 'piped',
  });

  const [status, output, errorOutput] = await Promise.all([
    process.status(),
    process.output(),
    process.stderrOutput(),
  ]);

  process.close();

  if (status.success && !errorOutput.length) {
    return new TextDecoder().decode(output).trim() || '';
  } else {
    return `Error: ${new TextDecoder().decode(errorOutput).trim()}`;
  }
}

async function askUser(question) {
  const buf = new Uint8Array(1024);

  await Deno.stdout.write(new TextEncoder().encode(question));
  const n = await Deno.stdin.read(buf);
  return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

async function saveMessagesToFile(messages) {
  const [, ...rest] = messages;

  const userInput = rest.find((msg) => msg.role === 'user').content;
  const words = userInput.split(/\s+/).slice(0, 5).join('_');
  const fileName = `chats/${words}.txt`;
  const formattedMessages = messages
    .map(
      (msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    )
    .join('\n');
  await Deno.writeTextFile(fileName, formattedMessages);
}

async function main() {
  const selectedModel = selectModel();
  let setupPrompt = await readSetupPrompt();
  let messages = [
    {
      role: 'user',
      content: setupPrompt,
    },
  ];
  let exit = false;

  while (!exit) {
    const userInput = await askUser('You: ');
    if (userInput.toLowerCase() === 'exit') {
      exit = true;
      continue;
    }

    messages.push({
      role: 'user',
      content: userInput,
    });

    const gptResponse = await fetchFromOpenAI(messages, selectedModel);
    const bashCommandMatches = [
      ...gptResponse.matchAll(/<bash>(.*?)<\/bash>/gs),
    ];

    let commandResults = '';

    if (bashCommandMatches.length > 0) {
      for (const match of bashCommandMatches) {
        const bashCommand = match[1].trim();
        console.log(`J.A.R.V.I.S suggested the command: ${bashCommand}`);
        const executeCommand = await askUser(
          'Do you want to execute this command? (y/n): '
        );

        if (executeCommand.toLowerCase() === 'y') {
          const commandResult = await executeBash(bashCommand);
          commandResults += `${bashCommand}: ${commandResult}\n`;
          console.log(`Command result:\n${commandResult}`);
        } else {
          commandResults += `Command not executed: ${bashCommand}\n`;
        }
      }

      messages.push({
        role: 'user',
        content: `PROMPT: ${commandResults}`,
      });

      // Fetch the assistant's response after sending the command results
      const followUpResponse = await fetchFromOpenAI(messages, selectedModel);
      messages.push({
        role: 'assistant',
        content: followUpResponse,
      });
      console.log(`J.A.R.V.I.S: ${followUpResponse}`);
    } else {
      messages.push({
        role: 'assistant',
        content: gptResponse,
      });
      console.log(`J.A.R.V.I.S: ${gptResponse}`);
    }

    await saveMessagesToFile(messages);
  }
}

main();
