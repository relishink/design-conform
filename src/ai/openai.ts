import type { Provider, StreamOptions } from './types'
import { errorMessage, readDataLines } from './sse'

interface OpenAiEvent {
  choices?: { delta?: { content?: string } }[]
  error?: { message?: string }
}

export const openai: Provider = {
  id: 'openai',
  label: 'OpenAI / Codex',
  keyUrl: 'https://platform.openai.com/',
  keyHint: 'Starts with sk-',
  models: [
    { id: 'gpt-5.1', label: 'GPT-5.1' },
    { id: 'gpt-5', label: 'GPT-5' },
    { id: 'gpt-4.1', label: 'GPT-4.1' },
  ],

  async *stream({ apiKey, model, system, messages, signal }: StreamOptions) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    })

    if (!response.ok) {
      throw new Error(await errorMessage(response, `OpenAI returned ${response.status}.`))
    }

    for await (const data of readDataLines(response)) {
      if (data === '[DONE]') return
      let event: OpenAiEvent
      try {
        event = JSON.parse(data) as OpenAiEvent
      } catch {
        continue
      }
      if (event.error) {
        throw new Error(event.error.message ?? 'OpenAI reported an error mid-stream.')
      }
      const text = event.choices?.[0]?.delta?.content
      if (text) yield text
    }
  },
}
