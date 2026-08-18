import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PrototypeFrame from '../components/PrototypeFrame'
import CheckerPanel from '../components/CheckerPanel'
import CodeBlock from '../components/CodeBlock'
import { runCheck } from '../checker/engine'
import type { CheckReport } from '../checker/types'
import {
  buildSpecMarkdown,
  buildStandaloneHtml,
  download,
} from '../checker/exportPrototype'
import { forkPrototype, getPrototype, savePrototype } from '../storage/prototypes'
import type { ChatMessage, Prototype as StoredPrototype } from '../storage/prototypes'
import { loadSettings } from '../storage/settings'
import { buildSystemPrompt, extractHtml, getProvider } from '../ai'

type Tab = 'prototype' | 'checker' | 'code'

export default function Prototype() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prototype, setPrototype] = useState<StoredPrototype | undefined>(() =>
    id ? getPrototype(id) : undefined,
  )
  const [tab, setTab] = useState<Tab>('prototype')
  const [report, setReport] = useState<CheckReport | null>(null)
  const [checkError, setCheckError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const [prompt, setPrompt] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [aiError, setAiError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const settings = loadSettings()
  const theme = settings.theme

  useEffect(() => {
    setPrototype(id ? getPrototype(id) : undefined)
  }, [id])

  const check = useCallback(
    async (html: string) => {
      if (!html.trim()) {
        setReport(null)
        setCheckError(null)
        return
      }
      setChecking(true)
      setCheckError(null)
      try {
        setReport(await runCheck(html, theme))
      } catch (error) {
        setCheckError(error instanceof Error ? error.message : String(error))
        setReport(null)
      } finally {
        setChecking(false)
      }
    },
    [theme],
  )

  useEffect(() => {
    if (prototype?.html) void check(prototype.html)
  }, [prototype?.html, check])

  useEffect(() => () => abortRef.current?.abort(), [])

  if (!id) return null

  if (!prototype) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div role="alert" className="alert alert-error">
          <span>That prototype no longer exists.</span>
        </div>
        <Link to="/prototypes" className="btn mt-4">
          Back to prototypes
        </Link>
      </div>
    )
  }

  async function generate(userPrompt: string) {
    const current = prototype
    if (!current || !userPrompt.trim()) return

    const settingsNow = loadSettings()
    if (!settingsNow.apiKey.trim()) {
      setAiError('Add an AI key in Settings before generating.')
      return
    }

    if (current.readOnly) {
      const copy = forkPrototype(current)
      navigate(`/prototypes/${copy.id}`)
      return
    }

    const provider = getProvider(settingsNow.provider)
    const controller = new AbortController()
    abortRef.current = controller

    const history: ChatMessage[] = [
      ...current.messages,
      { role: 'user', content: userPrompt.trim() },
    ]

    setStreaming(true)
    setStreamText('')
    setAiError(null)
    setPrompt('')
    setTab('prototype')

    let accumulated = ''
    try {
      for await (const chunk of provider.stream({
        apiKey: settingsNow.apiKey,
        model: settingsNow.model,
        system: buildSystemPrompt(),
        messages: history,
        signal: controller.signal,
      })) {
        accumulated += chunk
        setStreamText(accumulated)
      }

      const html = extractHtml(accumulated)
      const updated: StoredPrototype = {
        ...current,
        html,
        messages: [...history, { role: 'assistant', content: accumulated }],
        updatedAt: new Date().toISOString(),
      }
      savePrototype(updated)
      setPrototype(updated)
    } catch (error) {
      if (controller.signal.aborted) {
        setAiError('Generation stopped.')
      } else {
        setAiError(error instanceof Error ? error.message : String(error))
      }
    } finally {
      setStreaming(false)
      setStreamText('')
      abortRef.current = null
    }
  }

  function exportFiles() {
    if (!prototype) return
    const safeName = prototype.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    download(
      `${safeName || 'prototype'}.html`,
      buildStandaloneHtml(prototype.title, prototype.html, theme),
      'text/html',
    )
    if (report) {
      download(
        `${safeName || 'prototype'}-spec.md`,
        buildSpecMarkdown(prototype.title, report, prototype.html),
        'text/markdown',
      )
    }
  }

  const previewHtml = streaming ? extractHtml(streamText) : prototype.html
  const hasContent = previewHtml.trim().length > 0

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <nav aria-label="Breadcrumb" className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link to="/prototypes">Prototypes</Link>
              </li>
              <li aria-current="page">{prototype.title}</li>
            </ul>
          </nav>
          <h1 className="text-2xl font-bold">{prototype.title}</h1>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {prototype.readOnly && <span className="badge badge-ghost">Example — read only</span>}
          {prototype.readOnly && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => navigate(`/prototypes/${forkPrototype(prototype).id}`)}
            >
              Make an editable copy
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => void check(prototype.html)}
            disabled={!hasContent || checking}
          >
            Re-run checker
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={exportFiles}
            disabled={!hasContent}
          >
            Export
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-3">
          <div className="card card-border bg-base-100">
            <div className="card-body gap-3">
              <h2 className="card-title text-base">Describe the screen</h2>
              <textarea
                className="textarea h-28 w-full"
                placeholder={
                  prototype.html
                    ? 'Make the header sticky'
                    : 'A pricing page with three tiers and a comparison table'
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                aria-label="Prompt"
                disabled={streaming}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm flex-1"
                  onClick={() => void generate(prompt)}
                  disabled={streaming || !prompt.trim()}
                >
                  {streaming ? 'Generating…' : prototype.html ? 'Update' : 'Generate'}
                </button>
                {streaming && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => abortRef.current?.abort()}
                  >
                    Stop
                  </button>
                )}
              </div>
              {aiError && (
                <div role="alert" className="alert alert-error text-sm">
                  <span>{aiError}</span>
                </div>
              )}
              {!loadSettings().apiKey && (
                <p className="text-base-content/60 text-xs">
                  Generation needs your own AI key.{' '}
                  <Link to="/settings" className="link">
                    Add one in Settings
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>

          {prototype.messages.length > 0 && (
            <div className="card card-border bg-base-100">
              <div className="card-body gap-2">
                <h2 className="card-title text-base">History</h2>
                <ol className="flex flex-col gap-2 text-sm">
                  {prototype.messages
                    .filter((m) => m.role === 'user')
                    .map((m, i) => (
                      <li key={i} className="border-base-300 border-l-2 pl-2">
                        {m.content}
                      </li>
                    ))}
                </ol>
              </div>
            </div>
          )}
        </aside>

        <div className="border-base-300 rounded-box overflow-hidden border">
          <div role="tablist" className="tabs tabs-border bg-base-200 px-2 pt-2">
            <button
              role="tab"
              aria-selected={tab === 'prototype'}
              className={`tab ${tab === 'prototype' ? 'tab-active' : ''}`}
              onClick={() => setTab('prototype')}
            >
              Prototype
            </button>
            <button
              role="tab"
              aria-selected={tab === 'checker'}
              className={`tab ${tab === 'checker' ? 'tab-active' : ''}`}
              onClick={() => setTab('checker')}
            >
              Component Checker
              {report && report.summary.offSystemCount > 0 && (
                <span className="badge badge-xs badge-error ml-2">
                  {report.summary.offSystemCount}
                </span>
              )}
            </button>
            <button
              role="tab"
              aria-selected={tab === 'code'}
              className={`tab ${tab === 'code' ? 'tab-active' : ''}`}
              onClick={() => setTab('code')}
            >
              Code
            </button>
          </div>

          <div className="bg-base-100">
            {!hasContent ? (
              <div className="text-base-content/70 p-10 text-center">
                <p>Nothing generated yet. Describe a screen on the left to get started.</p>
              </div>
            ) : tab === 'prototype' ? (
              <PrototypeFrame html={previewHtml} theme={theme} className="h-[70vh]" />
            ) : tab === 'checker' ? (
              <CheckerPanel
                report={report}
                error={checkError}
                running={checking}
                onSendToAi={loadSettings().apiKey ? (p) => void generate(p) : undefined}
              />
            ) : (
              <div className="p-4">
                <CodeBlock code={previewHtml} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
