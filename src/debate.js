import readline from 'readline';
import { loadVoiceForDebate, VOICES } from './voices.js';
import { chat } from './api.js';
import { printDebateVoice, printSeparator, printSystem } from './display.js';
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

export async function startDebate(name1, name2) {
  if (!VOICES[name1]) {
    console.log(`that voice does not exist: ${name1}. type maestro --list.`);
    process.exit(1);
  }
  if (!VOICES[name2]) {
    console.log(`that voice does not exist: ${name2}. type maestro --list.`);
    process.exit(1);
  }

  const voice1 = loadVoiceForDebate(name1, name2);
  const voice2 = loadVoiceForDebate(name2, name1);

  if (!voice1 || !voice2) {
    console.log('voice file(s) not found. add them to voices/.');
    process.exit(1);
  }

  printSystem(`${name1} and ${name2} are in the room. describe what you're making.`);
  printSystem('/quit to end. /save to save a checkpoint.');

  // each voice maintains its own message history
  // but sees the other's responses via a shared narrative
  const history1 = [];
  const history2 = [];
  const transcript = [];

  const prompt = createPrompt();

  // first: get user's description
  const input = await prompt.ask();
  if (!input || input === '/quit' || input === '/q') {
    prompt.close();
    return;
  }

  // voice 1 responds to user
  history1.push({ role: 'user', content: input });
  const r1 = await chat(voice1.systemPrompt, history1);
  history1.push({ role: 'assistant', content: r1 });
  printDebateVoice(name1, r1);

  // voice 2 sees user input + voice 1's response
  history2.push({ role: 'user', content: `${input}\n\n[${name1} responds]: ${r1}` });
  const r2 = await chat(voice2.systemPrompt, history2);
  history2.push({ role: 'assistant', content: r2 });
  printSeparator();
  printDebateVoice(name2, r2);

  transcript.push(
    { role: 'user', content: input },
    { role: name1, content: r1 },
    { role: name2, content: r2 },
  );

  // ongoing debate loop
  while (true) {
    const userInput = await prompt.ask();

    if (!userInput) continue;
    if (userInput === '/quit' || userInput === '/q') break;

    if (userInput === '/' || userInput === '/help') {
      printSystem('/quit    end the session');
      printSystem('/save    save transcript');
      printSystem('/help    show this');
      continue;
    }

    if (userInput === '/save') {
      const file = saveTranscript(`debate-${name1}-${name2}`, transcript);
      printSystem(`transcript saved to ${file}`);
      continue;
    }

    // voice 1 sees user + last voice 2 response
    const ctx1 = `${userInput}\n\n[${name2}'s last point]: ${history2[history2.length - 1].content}`;
    history1.push({ role: 'user', content: ctx1 });
    const resp1 = await chat(voice1.systemPrompt, history1);
    history1.push({ role: 'assistant', content: resp1 });
    printDebateVoice(name1, resp1);

    // voice 2 sees user + voice 1's response
    const ctx2 = `${userInput}\n\n[${name1} responds]: ${resp1}`;
    history2.push({ role: 'user', content: ctx2 });
    const resp2 = await chat(voice2.systemPrompt, history2);
    history2.push({ role: 'assistant', content: resp2 });
    printSeparator();
    printDebateVoice(name2, resp2);

    transcript.push(
      { role: 'user', content: userInput },
      { role: name1, content: resp1 },
      { role: name2, content: resp2 },
    );
  }

  const file = saveTranscript(`debate-${name1}-${name2}`, transcript);
  printSystem(`session ended. transcript saved to ${file}`);

  prompt.close();
}
