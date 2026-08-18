import type { ProviderId } from '../storage/settings'
import type { Provider } from './types'
import { anthropic } from './anthropic'
import { openai } from './openai'

export const providers: Record<ProviderId, Provider> = { anthropic, openai }

export const providerList: Provider[] = [anthropic, openai]

export function getProvider(id: ProviderId): Provider {
  return providers[id] ?? anthropic
}

export * from './types'
export { buildSystemPrompt, extractHtml } from './systemPrompt'
