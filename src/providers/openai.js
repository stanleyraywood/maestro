import OpenAI from 'openai';

export function createChat(apiKey) {
  const client = new OpenAI({ apiKey });

  return async function chat(systemPrompt, messages) {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    return response.choices[0].message.content;
  };
}
