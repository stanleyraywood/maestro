import readline from 'readline';
import { saveConfig } from './config.js';
import { printLogo, printSeparator, printSystem } from './display.js';

const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const GOLD = '\x1b[38;2;204;170;68m';

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function maskKey(key) {
  if (key.length <= 7) return key;
  return key.slice(0, 7) + '·'.repeat(Math.min(key.length - 7, 20));
}

export async function runOnboarding() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log();
  printLogo();
  console.log(`  ${DIM}argue with the people who set the standards.${RESET}  ${DIM}v0.1.0${RESET}\n`);

  printSeparator();

  console.log('  first time? let\'s set up.\n');

  console.log('  which provider?');
  console.log(`    ${GOLD}[1]${RESET} anthropic (claude)`);
  console.log(`    ${GOLD}[2]${RESET} openai (chatgpt)\n`);

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

  console.log(`\n  ${GOLD}✓${RESET} saved. key: ${DIM}${maskKey(apiKey)}${RESET}`);

  printSeparator();

  console.log(`  ${GOLD}rams${RESET}            "what have you removed?"`);
  console.log(`  ${GOLD}vignelli${RESET}        "how many typefaces?"`);
  console.log(`  ${GOLD}bringhurst${RESET}      "what is the measure?"`);

  printSeparator();

  console.log('  maestro --voice rams       to begin.');
  console.log('  maestro --list             see the full cast.');
  console.log(`  ${DIM}/quit to end a session.${RESET}\n`);

  rl.close();
}
