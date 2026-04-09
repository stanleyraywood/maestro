import readline from 'readline';
import { saveConfig } from './config.js';
import { printHeader, printSeparator, printSystem } from './display.js';

const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const ITALIC = '\x1b[3m';

const QUOTES = [
  {
    text: 'indifference towards people and the reality\n  in which they live is actually the one and\n  only cardinal sin in design.',
    author: 'dieter rams',
  },
  {
    text: 'the life of a designer is a life of fight:\n  fight against the ugliness.',
    author: 'massimo vignelli',
  },
  {
    text: 'the details are not the details.\n  they make the design.',
    author: 'charles eames',
  },
  {
    text: 'have nothing in your houses that you do not\n  know to be useful, or believe to be beautiful.',
    author: 'william morris',
  },
  {
    text: 'typography exists to honor content.',
    author: 'robert bringhurst',
  },
];

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function maskKey(key) {
  if (key.length <= 7) return key;
  return key.slice(0, 7) + '·'.repeat(Math.min(key.length - 7, 20));
}

function randomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

export async function runOnboarding() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const quote = randomQuote();

  console.log();
  printHeader();
  console.log(`  ${DIM}${ITALIC}"${quote.text}"${RESET}`);
  console.log(`  ${DIM}— ${quote.author}${RESET}\n`);

  printSeparator();

  console.log('  first time? let\'s set up.\n');

  console.log('  which provider?');
  console.log('  [1] anthropic (claude)');
  console.log('  [2] openai (chatgpt)\n');

  let provider;
  while (true) {
    const choice = await ask(rl, '  > ');
    if (choice === '1' || choice === 'anthropic') {
      provider = 'anthropic';
      break;
    }
    if (choice === '2' || choice === 'openai') {
      provider = 'openai';
      break;
    }
    console.log('  1 or 2.');
  }

  console.log();
  console.log('  paste your API key:');

  const apiKey = await ask(rl, '  > ');

  if (!apiKey) {
    console.log('\n  no key entered.');
    rl.close();
    return;
  }

  // basic prefix check
  if (provider === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
    printSystem('that doesn\'t look like an anthropic key. saving anyway.');
  }
  if (provider === 'openai' && !apiKey.startsWith('sk-')) {
    printSystem('that doesn\'t look like an openai key. saving anyway.');
  }

  saveConfig({ provider, apiKey });

  console.log(`\n  saved. key: ${maskKey(apiKey)}`);

  printSeparator();

  console.log(`  ${DIM}rams${RESET}            "what have you removed?"`);
  console.log(`  ${DIM}vignelli${RESET}        "how many typefaces?"`);
  console.log(`  ${DIM}bringhurst${RESET}      "what is the measure?"`);

  printSeparator();

  console.log('  maestro --voice rams       to begin.');
  console.log('  maestro --list             to see the full cast.');
  console.log(`  ${DIM}type /quit or /q to end a session.${RESET}\n`);

  rl.close();
}
