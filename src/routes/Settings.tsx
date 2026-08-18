import { useState } from 'react'
import { providerList, getProvider } from '../ai'
import { defaultSettings, loadSettings, saveSettings } from '../storage/settings'
import type { ProviderId } from '../storage/settings'

export default function Settings() {
  const [settings, setSettings] = useState(() => loadSettings())
  const [saved, setSaved] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const provider = getProvider(settings.provider)

  function update(patch: Partial<typeof settings>) {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  function changeProvider(id: ProviderId) {
    // The previously selected model belongs to the old provider, so reset it.
    update({ provider: id, model: getProvider(id).models[0].id })
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-base-content/70 mt-2">
          Design Conform is model-agnostic and ships with no key of its own. Add yours to unlock
          generation — the library, checker and standards work without one.
        </p>
      </header>

      <section className="card card-border bg-base-100 mb-6">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">AI provider</h2>

          <div>
            <label className="label" htmlFor="provider">
              Provider
            </label>
            <select
              id="provider"
              className="select w-full"
              value={settings.provider}
              onChange={(e) => changeProvider(e.target.value as ProviderId)}
            >
              {providerList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="model">
              Model
            </label>
            <select
              id="model"
              className="select w-full"
              value={settings.model}
              onChange={(e) => update({ model: e.target.value })}
            >
              {provider.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="api-key">
              API key
            </label>
            <div className="join w-full">
              <input
                id="api-key"
                type={revealed ? 'text' : 'password'}
                className="input join-item w-full font-mono"
                placeholder={provider.keyHint}
                value={settings.apiKey}
                onChange={(e) => update({ apiKey: e.target.value })}
                autoComplete="off"
                spellCheck={false}
                aria-describedby="api-key-help"
              />
              <button
                type="button"
                className="btn join-item"
                onClick={() => setRevealed(!revealed)}
              >
                {revealed ? 'Hide' : 'Show'}
              </button>
            </div>
            <p id="api-key-help" className="label mt-1 text-xs">
              Get a key at{' '}
              <a href={provider.keyUrl} target="_blank" rel="noreferrer" className="link">
                {new URL(provider.keyUrl).host}
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => update({ apiKey: '' })}
              disabled={!settings.apiKey}
            >
              Remove key
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setSettings({ ...defaultSettings, theme: settings.theme })
                saveSettings({ ...defaultSettings, theme: settings.theme })
              }}
            >
              Reset to defaults
            </button>
            {saved && (
              <span role="status" className="text-success text-sm">
                Saved
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="card card-border bg-base-100">
        <div className="card-body gap-2">
          <h2 className="card-title text-base">Where your key goes</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>
              It is stored in this browser&rsquo;s local storage and sent only to{' '}
              {provider.label}. There is no server in this project to send it to.
            </li>
            <li>
              Anything running in this page can read local storage, so use a key scoped to what you
              are willing to spend, and remove it when you are done on a shared machine.
            </li>
            <li>Clearing site data removes it. So does the Remove key button above.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
