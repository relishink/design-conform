/**
 * Mounting untrusted prototype markup so it can be measured.
 *
 * Reading computed styles requires `allow-same-origin`; running the prototype's
 * scripts requires `allow-scripts`. Granting both to one frame would let that
 * markup reach into this app, so the two capabilities live in two frames and
 * are never combined:
 *
 *   - analysis frame (here):  allow-same-origin only. We can read its DOM and
 *     computed styles; nothing in it can execute.
 *   - preview frame (PrototypeFrame.tsx): allow-scripts, no same-origin. It can
 *     run and be interacted with, and cannot touch this document.
 */

let cachedStyles: string | null = null

/**
 * The app's own compiled Tailwind + daisyUI CSS, as text. Injecting it means
 * the checker measures the exact rendering the designer sees, rather than an
 * approximation loaded from somewhere else.
 */
export function collectAppStyles(): string {
  if (cachedStyles !== null) return cachedStyles

  const parts: string[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) parts.push(rule.cssText)
    } catch {
      // A cross-origin sheet throws on cssRules. We ship no such sheet, so the
      // only way here is a browser extension's stylesheet, which we skip.
    }
  }

  cachedStyles = parts.join('\n')
  return cachedStyles
}

/**
 * Marks a document as ours. Appending an iframe fires a `load` event for its
 * initial `about:blank`, so without a sentinel the checker reads an empty
 * document and reports a clean bill of health — the worst way to be wrong.
 */
export const READY_ATTRIBUTE = 'data-design-conform-ready'

export function buildDocument(bodyHtml: string, theme = 'light'): string {
  return `<!doctype html>
<html lang="en" data-theme="${theme}" ${READY_ATTRIBUTE}="1">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>${collectAppStyles()}</style>
</head>
<body>${bodyHtml}</body>
</html>`
}

export interface AnalysisResult<T> {
  value: T
}

/**
 * Renders `bodyHtml` in a script-free, same-origin frame and hands the document
 * to `fn`. The frame is torn down afterwards, including on throw.
 */
export function withAnalysisDocument<T>(
  bodyHtml: string,
  fn: (doc: Document) => T,
  theme = 'light',
): Promise<T> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe')
    // No allow-scripts. Prototype script cannot run in this frame.
    frame.setAttribute('sandbox', 'allow-same-origin')
    frame.setAttribute('aria-hidden', 'true')
    frame.setAttribute('tabindex', '-1')
    frame.title = 'Prototype analysis (offscreen)'
    // Rendered but out of view: computed styles need layout, so `display: none`
    // is not an option.
    frame.style.cssText =
      'position:absolute;left:-10000px;top:0;width:1280px;height:900px;border:0;opacity:0;pointer-events:none;'

    let settled = false
    const cleanup = () => {
      frame.remove()
    }

    const timeout = window.setTimeout(() => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error('Timed out preparing the prototype for analysis.'))
    }, 10_000)

    frame.addEventListener('load', () => {
      if (settled) return
      const doc = frame.contentDocument
      // Ignore the initial about:blank load; wait for the document we wrote.
      if (!doc?.documentElement?.hasAttribute(READY_ATTRIBUTE)) return

      settled = true
      window.clearTimeout(timeout)
      try {
        resolve(fn(doc))
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)))
      } finally {
        cleanup()
      }
    })

    frame.srcdoc = buildDocument(bodyHtml, theme)
    document.body.appendChild(frame)
  })
}
