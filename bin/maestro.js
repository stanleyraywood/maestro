#!/usr/bin/env node

import { program } from 'commander';
import { startSession } from '../src/session.js';
import { startDebate } from '../src/debate.js';
import { listCast, printLogo, printSeparator, printSystem } from '../src/display.js';
import { VOICES, TYPEFACES } from '../src/voices.js';
import { needsOnboarding } from '../src/config.js';
import { runOnboarding } from '../src/onboarding.js';
import { setProvider } from '../src/api.js';
import { scrapeDesignContext } from '../src/scrape.js';

const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

program
  .name('maestro')
  .version('0.1.0')
  .description('argue with the people who set the standards.');

program
  .option('--voice <name>', 'start a session with a design voice')
  .option('--typeface <name>', 'get feedback from a typeface designer')
  .option('--debate <voices...>', 'two voices review your work')
  .option('--list', 'show the cast')
  .option('--url <url>', 'submit a website for critique')
  .option('--provider <name>', 'anthropic or openai')
  .action(async (opts) => {
    if (opts.provider) {
      setProvider(opts.provider);
    }

    if (opts.list) {
      listCast();
      process.exit(0);
    }

    // validate names first, before onboarding
    if (opts.voice) {
      const name = opts.voice.toLowerCase();
      if (!VOICES[name]) {
        console.log(`that voice does not exist. type maestro --list.`);
        process.exit(1);
      }
    }

    if (opts.typeface) {
      const name = opts.typeface.toLowerCase();
      if (!TYPEFACES[name]) {
        console.log(`that typeface does not exist. type maestro --list.`);
        process.exit(1);
      }
    }

    if (opts.debate) {
      if (opts.debate.length !== 2) {
        console.log('debate needs two voices. e.g. maestro --debate rams vignelli');
        process.exit(1);
      }
      for (const v of opts.debate) {
        if (!VOICES[v]) {
          console.log(`that voice does not exist: ${v}. type maestro --list.`);
          process.exit(1);
        }
      }
    }

    // --url requires a voice
    if (opts.url && !opts.voice) {
      console.log('--url needs a voice. e.g. maestro --url https://example.com --voice morris');
      process.exit(1);
    }

    // commands that need the API — check for onboarding
    const needsApi = opts.voice || opts.typeface || opts.debate;

    if (needsApi && needsOnboarding(opts.provider)) {
      await runOnboarding();
      process.exit(0);
    }

    if (opts.debate) {
      await startDebate(opts.debate[0], opts.debate[1]);
      return;
    }

    if (opts.voice) {
      let urlContext = null;
      if (opts.url) {
        try {
          urlContext = await scrapeDesignContext(opts.url);
        } catch (err) {
          console.log(`  could not fetch ${opts.url}: ${err.message}`);
          process.exit(1);
        }
      }
      await startSession(opts.voice.toLowerCase(), 'voice', urlContext);
      return;
    }

    if (opts.typeface) {
      await startSession(opts.typeface.toLowerCase(), 'typeface');
      return;
    }

    // no args — show welcome
    const GOLD = '\x1b[38;2;204;170;68m';

    console.log();
    printLogo();
    console.log(`  ${GOLD}Design Critique${RESET}`);
    console.log(`  ${DIM}argue with the people who set the standards.${RESET}\n`);

    console.log('  maestro --voice morris            begin a session');
    console.log('  maestro --typeface baskerville    critique your type usage');
    console.log('  maestro --debate eames vignelli');
    console.log('  maestro --url https://example.com --voice rand');
    console.log('  maestro --list                    see the cast');
    console.log();
    console.log(`  ${DIM}maestro --help if you need it. they wouldn't.${RESET}`);
    console.log();
  });

program.parse();
