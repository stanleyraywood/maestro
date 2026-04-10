import { VOICES, TYPEFACES } from './voices.js';

const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const ITALIC = '\x1b[3m';

const RULE_CHAR = '─';
const BORDER_CHAR = '│';

// William Morris, cropped portrait — jp2a, 40 cols
const MORRIS_ART = `
       ..........''''',,'..',;,,'.',,,;;;;;;;,,
     ...........''''',,,'.',;;;;;;,,,,;;;;;;;;;,
    .........''''''',,,'''',;;;;;,,;;,;;;;;;;;;,
    ..........'''''',,,,''',;;;;;,,;;;;;;;;;;;;;;
    ...........'''.',,,,'.',;;;;;,';;;;,;;;;;;;;;
    .........''';,...''..','..',,,,,,;;,,;;;;;;;;;,
    .........,'''.........'',,,,,,,',;,,,,,;;;;;;;'
    ........',,...  ..  .',;:::;,,'',,,,,,,,,,,,,,,'
    ........ .'..          ..';oc,'.,',,,,,,,,,,,,,'
    ......  .......  ......';:,';l;,,,',,,,,,',,,'''
    .........     .....,;olkkOkcll:;;;;,,,,,,,'''''''
    .........    . ..cxO0000KKkdxdoc:;;,,,,,'''''''''
   ........     ..,,;oxO00KKK0KKK0xoc:,,;,','''''''''
    ........   ..:lxkkOO000000kkkkOxoo:...,''''''.''..
   .........  .':ldxkkOOOkOO00OOOkkkko;,...','''''.....
  .........  .'';:clodxkOkkk000Okddodkd;.,..'''''..'.'
   ......... .',.':coxkkOOkxkkocoxkxcdxo;.,.','''''''''
  ........   .''..';codxxkkxc;;c:,,;ckkxdl:c..'''''''''
.................;::::::::dkx;:ocxO00K0Oxxll'..........
.........  ......';:,...;kKOkxdkkO00kxxxdlc:;'''......
.........  .. .. ...;oo:'c0KO000000Okxxdocl::;,,,,,,,,,
..........   ..  ...';clo:'c00kkxkOOOOkkdlcdkxl:'..''''
..............   .,;;::clc';dKkxoodxkkkxl::dOOOkdc.....
............,:,....',;clol;.;lc,;OOOkkxkdc:;cdxxxo,....
...........,':ccd;.',;:cldl'...,;:olccldxoc:lolllc:....
...........,;llool;.',;cllc:'......'::::::::ccolcc;,...
  .........':cloddol,..';c,....',;cllcodl:;::lc:;,'. .
   ........,:codxdddl'...;,''',:oooxkxdoclll::c,,;'..
    .......'::lloodxdoc'.''.';c;ccclcoxxdxlcc:;lc''.'.
    .......,cclloddddoc. ...':ccc;lcc;oddll:,:;;c,'..
    ......,lododddooc;.. ....,,,;cclollc:::;',':,'''..
    ....  .coxkkxdl:;'.. ....'.,,,c:;lcol:;;,',,:,'....
          .lodxxdl,..      .....,,,;;',':l:,,,',......
          .odxxdl,.       . .......''..''c:;,,,.....
           ,dddo:..         ........'...'.';;::,...
            .loc,.,.       ..............'',,;:,.'..`.trim();

export function printMorris() {
  for (const line of MORRIS_ART.split('\n')) {
    console.log(`  ${DIM}${line}${RESET}`);
  }
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
  console.log(`\n  ${BOLD}${name}${RESET}`);
  for (const line of wrapped) {
    console.log(line);
  }
  console.log();
}

export function printDebateVoice(name, text) {
  const width = Math.min(68, termWidth() - 6);
  const wrapped = wrapText(text, width, '');
  console.log(`\n  ${BOLD}${name}${RESET}`);
  for (const line of wrapped) {
    console.log(`  ${DIM}${BORDER_CHAR}${RESET} ${line}`);
  }
}

export function printSystem(text) {
  console.log(`  ${DIM}${text}${RESET}`);
}

export function listCast() {
  console.log();
  printHeader();
  console.log(`  ${BOLD}the cast.${RESET}`);
  console.log(`  ${DIM}${RULE_CHAR.repeat(ruleWidth())}${RESET}\n`);

  console.log(`  ${BOLD}voices${RESET}\n`);

  const pad = 16;
  for (const [key, v] of Object.entries(VOICES)) {
    console.log(`    ${key.padEnd(pad)}${DIM}${v.domain}${RESET}`);
  }

  console.log(`\n  ${BOLD}typefaces${RESET}\n`);

  for (const [key, t] of Object.entries(TYPEFACES)) {
    console.log(`    ${key.padEnd(pad)}${DIM}${t.designer}, ${t.year}${RESET}`);
  }

  console.log(`\n  ${DIM}${RULE_CHAR.repeat(ruleWidth())}${RESET}`);
  console.log(`  ${DIM}maestro --voice rams to begin.${RESET}\n`);
}
