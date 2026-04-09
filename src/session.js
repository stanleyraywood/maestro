import readline from 'readline';
import { loadVoice } from './voices.js';
import { chat } from './api.js';
import { printVoice, printSystem } from './display.js';
import { saveTranscript } from './transcript.js';

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    ask: () => new Promise((resolve) => {
      rl.question('> ', (answer) => resolve(answer.trim()));
    }),
    close: () => rl.close(),
  };
}

export async function startSession(name, type = 'voice') {
  const voice = loadVoice(name, type);

  if (!voice) {
    console.log(`voice file not found: ${name}. add it to ${type === 'voice' ? 'voices' : 'typefaces'}/${name}.md`);
    process.exit(1);
  }

  const messages = [];

  // opening — voice introduces itself
  printSystem('consulting the archive.');
  printSystem('/quit to end. /save to save a checkpoint.');

  const opening = await chat(voice.systemPrompt, [
    { role: 'user', content: 'begin the session. introduce yourself in one line and ask the designer to describe their work.' }
  ]);

  messages.push(
    { role: 'user', content: 'begin the session. introduce yourself in one line and ask the designer to describe their work.' },
    { role: 'assistant', content: opening }
  );

  printVoice(name, opening);

  // conversation loop
  const prompt = createPrompt();

  while (true) {
    const input = await prompt.ask();

    if (!input) continue;
    if (input === '/quit' || input === '/q') break;

    if (input === '/save') {
      const file = saveTranscript(name, messages);
      printSystem(`transcript saved to ${file}`);
      continue;
    }

    messages.push({ role: 'user', content: input });

    const response = await chat(voice.systemPrompt, messages);
    messages.push({ role: 'assistant', content: response });

    printVoice(name, response);
  }

  // auto-save on exit
  const file = saveTranscript(name, messages);
  printSystem(`session ended. transcript saved to ${file}`);

  prompt.close();
}
