import type { ProviderId } from '../storage/settings'

export interface ModelOption {
  id: string
  label: string
}

export interface StreamOptions {
  apiKey: string
  model: string
  system: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  signal?: AbortSignal
}

export interface Provider {
  id: ProviderId
  label: string
  keyUrl: string
  keyHint: string
  models: ModelOption[]
  stream(options: StreamOptions): AsyncIterable<string>
}
