import fs from 'fs';
import path from 'path';
import os from 'os';

const MAESTRO_DIR = path.join(os.homedir(), '.maestro');
const CONFIG_PATH = path.join(MAESTRO_DIR, 'config.json');

export function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(raw);
    if (config.provider && config.apiKey) return config;
    return null;
  } catch {
    return null;
  }
}

export function saveConfig({ provider, apiKey }) {
  if (!fs.existsSync(MAESTRO_DIR)) {
    fs.mkdirSync(MAESTRO_DIR, { recursive: true });
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify({
    provider,
    apiKey,
    createdAt: new Date().toISOString(),
  }, null, 2));
}

export function resolveProvider(providerOverride) {
  // 1. env vars (highest priority)
  if (providerOverride === 'openai' && process.env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
  }
  if (providerOverride === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    return { provider: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY };
  }

  // no override — check env vars in preference order
  if (!providerOverride) {
    if (process.env.ANTHROPIC_API_KEY) {
      return { provider: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY };
    }
    if (process.env.OPENAI_API_KEY) {
      return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
    }
  }

  // 2. config file
  const config = loadConfig();
  if (config) {
    if (providerOverride && config.provider !== providerOverride) {
      // config exists but for wrong provider — check env for the requested one
      return null;
    }
    return config;
  }

  return null;
}

export function needsOnboarding(providerOverride) {
  return resolveProvider(providerOverride) === null;
}
