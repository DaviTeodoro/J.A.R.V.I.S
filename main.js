#!/usr/bin/env -S deno run --allow-net --allow-run --allow-read --allow-write --unstable

import { green, red } from 'https://deno.land/std/fmt/colors.ts';
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
    return `Erro: ${new TextDecoder().decode(errorOutput).trim()}`;
  }
}
async function askUser(question) {
  const buf = new Uint8Array(1024);

  await Deno.stdout.write(new TextEncoder().encode(question));
  const n = await Deno.stdin.read(buf);
  return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

async function saveMessagesToFile(messages) {
  const [setupMessage, ...rest] = messages;

  const userInput = rest.find((msg) => msg.role === 'user').content;
  const words = userInput.split(/\s+/).slice(0, 5).join('_');
  const fileName = `mensagens/chat_${words}.txt`;
  const formattedMessages = messages
    .map(
      (msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    )
    .join();
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
    const userInput = await askUser('User: ');

    if (!userInput) {
      console.error(red('Por favor, forneça uma entrada.'));
      continue;
    }

    messages.push({ role: 'user', content: userInput });
    let result = await fetchFromOpenAI(messages, selectedModel);

    let match;
    do {
      match = result.match(/<bash>(.*?)<\/bash>/s);

      if (match) {
        const bashCommand = match[1].trim();
        console.log(green(`Assistant: ${result}`));
        const executeConfirmation = await askUser(
          `A API retornou um comando para ser executado: "${bashCommand}". Você deseja executá-lo? (s/n): `
        );

        if (executeConfirmation.toLowerCase() === 's') {
          const commandResult = await executeBash(bashCommand);
          const isError = commandResult.startsWith('Erro: ');
          const wordCount = commandResult.split(/\s+/).length;

          console.log(green(`Resultado do comando: ${commandResult}`));

          if (wordCount > 100) {
            const sendResponse = await askUser(
              `${
                isError ? 'Erro' : 'Resultado'
              } do comando: "${commandResult}". Este resultado é longo, contendo mais de 100 palavras. Você deseja enviar isso de volta para a API? (s/n): `
            );

            if (sendResponse.toLowerCase() === 's') {
              messages.push({ role: 'assistant', content: result });
              await saveMessagesToFile(messages);

              messages.push({
                role: 'user',
                content: `PROMPT: ${commandResult}`,
              });
              result = await fetchFromOpenAI(messages, selectedModel);
            } else {
              break;
            }
          } else {
            messages.push({ role: 'assistant', content: result });
            await saveMessagesToFile(messages);

            messages.push({
              role: 'user',
              content: `PROMPT: ${commandResult}`,
            });
            result = await fetchFromOpenAI(messages, selectedModel);
          }
        } else {
          break;
        }
      }
    } while (match);

    console.log(green(`Assistant: ${result}`));
    messages.push({ role: 'assistant', content: result });
    await saveMessagesToFile(messages);
  }
}

main();
