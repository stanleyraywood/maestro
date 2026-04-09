import fs from 'fs';
import path from 'path';
import os from 'os';

const SESSIONS_DIR = path.join(os.homedir(), '.maestro', 'sessions');

function ensureDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

export function saveTranscript(voiceName, messages) {
  ensureDir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${voiceName}-${timestamp}.json`;
  const filePath = path.join(SESSIONS_DIR, filename);

  fs.writeFileSync(filePath, JSON.stringify({
    voice: voiceName,
    date: new Date().toISOString(),
    messages,
  }, null, 2));

  return filePath;
}
