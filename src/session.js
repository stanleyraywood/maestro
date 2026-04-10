import readline from 'readline';
import { loadVoice } from './voices.js';
import { chat } from './api.js';
import { printVoice, printSystem } from './display.js';
import { saveTranscript } from './transcript.js';

const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    ask: (showHint = false) => new Promise((resolve) => {
      if (showHint) {
        console.log(`  ${DIM}/quit · /save · /help${RESET}`);
      }
      rl.question('> ', (answer) => resolve(answer.trim()));
    }),
    close: () => rl.close(),
  };
}

export async function startSession(name, type = 'voice', urlContext = null) {
  const voice = loadVoice(name, type);

  if (!voice) {
    console.log(`voice file not found: ${name}. add it to ${type === 'voice' ? 'voices' : 'typefaces'}/${name}.md`);
    process.exit(1);
  }

  const messages = [];

  // opening — voice introduces itself
  printSystem('consulting the archive.');
  printSystem('/quit to end. /save to save a checkpoint.');

  const openingPrompt = urlContext
    ? `a designer has submitted their website for your review. here is the analysis:\n\n${urlContext}\n\nintroduce yourself in one line, then begin your critique based on the design signals. ask your three questions.`
    : 'begin the session. introduce yourself in one line and ask the designer to describe their work.';

  const opening = await chat(voice.systemPrompt, [
    { role: 'user', content: openingPrompt }
  ]);

  messages.push(
    { role: 'user', content: openingPrompt },
    { role: 'assistant', content: opening }
  );

  printVoice(name, opening);

  // conversation loop
  const prompt = createPrompt();
  let firstPrompt = true;

  while (true) {
    const input = await prompt.ask(firstPrompt);
    firstPrompt = false;

    if (!input) continue;
    if (input === '/quit' || input === '/q') break;

    if (input === '/' || input === '/help') {
      printSystem('/quit    end the session');
      printSystem('/save    save transcript');
      printSystem('/help    show this');
      continue;
    }

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
