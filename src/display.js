import { VOICES, TYPEFACES } from './voices.js';

const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const ITALIC = '\x1b[3m';

// mustard gold — 24-bit ANSI color
const GOLD = '\x1b[38;2;204;170;68m';

const RULE_CHAR = '─';
const BORDER_CHAR = '│';

const MASCOT = `
        ░▒▓▓█▓▓▓█▓▓▒░
      ░▓▓▒▒░▒▒▒░▒▒▓▓▒░
     ▒▓▒░▒▒▒▒▒▒▒▒▒░▒▓▒
     ▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓
     ▓▒▒ ▓▓ ▒▒▒ ▓▓ ▒▒▓
     ▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓
     ▓▒▒▒▒▒▒▒██▒▒▒▒▒▒▓
      ▓▒▒▒▒▒▒▒▒▒▒▒▒▒▓
     ▓░▒░▒░▒░▒░▒░▒░▒░▓
    ▓░▒░▒░▒░▒░▒░▒░▒░▒░▓
    ▓░▒░▒░▒░▒░▒░▒░▒░▒░▓
 █▄ ▓░▒░▒░▒░▒░▒░▒░▒░▒░▓
 ██▌▓░▒░▒░▒░▒░▒░▒░▒░▒░▓
 █▀ ▓░▒░▒░▒░▒░▒░▒░▒░▒░▓
     ▓░▒░▒░▒░▒░▒░▒░▒░▓
      ▓░▒░▒░▒░▒░▒░▒░▓
       ▀▓░▒░▒░▒░▒░▓▀
         ▀▀▓▓▓▓▓▀▀`.trim();

const LOGO = `
                                                    ░██
                                                    ░██
░█████████████   ░██████    ░███████   ░███████  ░████████ ░██░████  ░███████
░██   ░██   ░██       ░██  ░██    ░██ ░██           ░██    ░███     ░██    ░██
░██   ░██   ░██  ░███████  ░█████████  ░███████     ░██    ░██      ░██    ░██
░██   ░██   ░██ ░██   ░██  ░██               ░██    ░██    ░██      ░██    ░██
░██   ░██   ░██  ░█████░██  ░███████   ░███████      ░████ ░██       ░███████`.trim();

export function printMascot() {
  for (const line of MASCOT.split('\n')) {
    console.log(`    ${GOLD}${line}${RESET}`);
  }
  console.log();
}

export function printLogo() {
  for (const line of LOGO.split('\n')) {
    console.log(`  ${GOLD}${line}${RESET}`);
  }
  console.log();
}

function termWidth() {
  return process.stdout.columns || 80;
}

function ruleWidth() {
  return Math.min(40, termWidth() - 4);
}

function wrapText(text, width, indent = '  ') {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    if (paragraph.trim() === '') {
      lines.push('');
      continue;
    }
    const words = paragraph.split(/\s+/);
    let line = '';
    for (const word of words) {
      if (line && (indent + line + ' ' + word).length > width) {
        lines.push(indent + line);
        line = word;
      } else {
        line = line ? line + ' ' + word : word;
      }
    }
    if (line) lines.push(indent + line);
  }
  return lines;
}

export function printHeader() {
  console.log(`  ${BOLD}m a e s t r o .${RESET}\n`);
  console.log(`  ${DIM}argue with the people who set the standards.${RESET}\n`);
}

export function printSeparator() {
  console.log(`\n  ${DIM}${RULE_CHAR.repeat(ruleWidth())}${RESET}\n`);
}

export function printVoice(name, text) {
  const width = Math.min(72, termWidth() - 2);
  const wrapped = wrapText(text, width);
  console.log(`\n  ${GOLD}${BOLD}${name}${RESET}`);
  for (const line of wrapped) {
    console.log(line);
  }
  console.log();
}

export function printDebateVoice(name, text) {
  const width = Math.min(68, termWidth() - 6);
  const wrapped = wrapText(text, width, '');
  console.log(`\n  ${GOLD}${BOLD}${name}${RESET}`);
  for (const line of wrapped) {
    console.log(`  ${DIM}${BORDER_CHAR}${RESET} ${line}`);
  }
}

export function printSystem(text) {
  console.log(`  ${DIM}${text}${RESET}`);
}

export function listCast() {
  console.log();
  printLogo();
  console.log(`  ${DIM}argue with the people who set the standards.${RESET}\n`);
  console.log(`  ${BOLD}the cast.${RESET}`);
  console.log(`  ${DIM}${RULE_CHAR.repeat(ruleWidth())}${RESET}\n`);

  console.log(`  ${BOLD}voices${RESET}\n`);

  const pad = 16;
  for (const [key, v] of Object.entries(VOICES)) {
    console.log(`    ${GOLD}${key.padEnd(pad)}${RESET}${DIM}${v.domain}${RESET}`);
  }

  console.log(`\n  ${BOLD}typefaces${RESET}\n`);

  for (const [key, t] of Object.entries(TYPEFACES)) {
    console.log(`    ${GOLD}${key.padEnd(pad)}${RESET}${DIM}${t.designer}, ${t.year}${RESET}`);
  }

  console.log(`\n  ${DIM}${RULE_CHAR.repeat(ruleWidth())}${RESET}`);
  console.log(`  ${DIM}maestro --voice rams to begin.${RESET}\n`);
}
