import { resolveProvider } from './config.js';

let chatFn = null;
let providerOverride = null;

export function setProvider(name) {
  providerOverride = name;
}

async function ensureProvider() {
  if (chatFn) return;

  const resolved = resolveProvider(providerOverride);

  if (!resolved) {
    console.error('no API key found. run maestro to set up.');
    process.exit(1);
  }

  if (resolved.provider === 'openai') {
    const { createChat } = await import('./providers/openai.js');
    chatFn = createChat(resolved.apiKey);
  } else {
    const { createChat } = await import('./providers/anthropic.js');
    chatFn = createChat(resolved.apiKey);
  }
}

export async function chat(systemPrompt, messages) {
  await ensureProvider();
  return chatFn(systemPrompt, messages);
}
