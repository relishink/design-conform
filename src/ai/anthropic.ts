import type { Provider, StreamOptions } from './types'
import { errorMessage, readDataLines } from './sse'

interface AnthropicEvent {
  type: string
  delta?: { type?: string; text?: string }
  error?: { message?: string }
}

export const anthropic: Provider = {
  id: 'anthropic',
  label: 'Claude (Anthropic)',
  keyUrl: 'https://console.anthropic.com/',
  keyHint: 'Starts with sk-ant-',
  models: [
    { id: 'claude-opus-5', label: 'Claude Opus 5 — most capable' },
    { id: 'claude-sonnet-5', label: 'Claude Sonnet 5 — balanced' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 — fastest' },
  ],

  async *stream({ apiKey, model, system, messages, signal }: StreamOptions) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        // Required for the API to accept a request straight from a browser.
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 16000,
        stream: true,
        system,
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(
        await errorMessage(response, `Anthropic returned ${response.status}.`),
      )
    }

    for await (const data of readDataLines(response)) {
      let event: AnthropicEvent
      try {
        event = JSON.parse(data) as AnthropicEvent
      } catch {
        continue
      }
      if (event.type === 'error') {
        throw new Error(event.error?.message ?? 'Anthropic reported an error mid-stream.')
      }
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        yield event.delta.text ?? ''
      }
    }
  },
}
