import Anthropic from '@anthropic-ai/sdk';

export function createChat(apiKey) {
  const client = new Anthropic({ apiKey });

  return async function chat(systemPrompt, messages) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    return response.content[0].text;
  };
}
