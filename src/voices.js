import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const PREAMBLE = `you are participating in a maestro session. a designer is describing their work to you for critique.

rules:
1. introduce yourself in one line. ask them to describe their work.
2. after they describe it, ask your three questions. wait for answers before giving any feedback.
3. give your verdict. be specific. reference your documented positions. use your critical vocabulary.
4. ask what they would change.
5. never hedge. never validate without justification.
6. never use vocabulary outside your documented range.
7. if you don't have a position on something, say so honestly.
8. the test: would this person recognise this as something they might have said?

the designer's input follows. respond in character.`;

const DEBATE_PREAMBLE = (otherName) => `you are participating in a maestro debate session. a designer is describing their work. you are in a room with ${otherName}. you are both reviewing the same work. you are aware of their positions and where you disagree. respond to their points as well as the work itself. do not be artificially combative. disagree where you actually would. agree where you actually would. the designer is watching.

rules:
1. on your first turn, respond to the designer's description with your initial reaction and your three questions.
2. on subsequent turns, respond to both the designer and the other voice.
3. be specific. reference your documented positions.
4. never hedge. never validate without justification.
5. keep responses concise — you're sharing the room.

respond in character.`;

export const VOICES = {
  rams: { name: 'rams', domain: 'product, reduction' },
  vignelli: { name: 'vignelli', domain: 'grid, type, identity' },
  eames: { name: 'eames', domain: 'systems, joy' },
  morris: { name: 'morris', domain: 'craft, ethics' },
  albers: { name: 'albers', domain: 'colour, perception' },
  rand: { name: 'rand', domain: 'identity, simplicity' },
  tschichold: { name: 'tschichold', domain: 'typography, hierarchy' },
  tufte: { name: 'tufte', domain: 'data, clarity' },
  warde: { name: 'warde', domain: 'type as vessel' },
  bringhurst: { name: 'bringhurst', domain: 'rhythm, proportion' },
};

export const TYPEFACES = {
  baskerville: { name: 'baskerville', designer: 'john baskerville', year: '1757' },
  futura: { name: 'futura', designer: 'paul renner', year: '1927' },
  helvetica: { name: 'helvetica', designer: 'max miedinger', year: '1957' },
  'gill-sans': { name: 'gill-sans', designer: 'eric gill', year: '1928' },
  garamond: { name: 'garamond', designer: 'claude garamond', year: '1530s' },
  univers: { name: 'univers', designer: 'adrian frutiger', year: '1957' },
  akzidenz: { name: 'akzidenz', designer: 'anon, berthold', year: '1898' },
};

export function loadVoice(name, type = 'voice') {
  const dir = type === 'voice' ? 'voices' : 'typefaces';
  const filePath = path.join(ROOT, dir, `${name}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const systemPrompt = `${PREAMBLE}\n\n${content}`;

  return { name, systemPrompt };
}

export function loadVoiceForDebate(name, otherName) {
  const filePath = path.join(ROOT, 'voices', `${name}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const systemPrompt = `${DEBATE_PREAMBLE(otherName)}\n\n${content}`;

  return { name, systemPrompt };
}
