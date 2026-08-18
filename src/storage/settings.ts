export type ProviderId = 'anthropic' | 'openai'

export interface Settings {
  provider: ProviderId
  model: string
  /** Stored in this browser only. Sent only to the selected provider. */
  apiKey: string
  theme: 'light' | 'dark'
}

const KEY = 'design-conform:settings'

export const defaultSettings: Settings = {
  provider: 'anthropic',
  model: 'claude-opus-5',
  apiKey: '',
  theme: 'light',
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultSettings }
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(settings))
}

export function clearApiKey(): void {
  const settings = loadSettings()
  saveSettings({ ...settings, apiKey: '' })
}

export function hasKey(): boolean {
  return loadSettings().apiKey.trim().length > 0
}
