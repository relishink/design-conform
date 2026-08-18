import type { ElementRecord, Finding, Severity } from '../types'

export function finding(
  ruleId: string,
  severity: Severity,
  message: string,
  record: ElementRecord,
): Finding {
  return {
    ruleId,
    severity,
    message,
    snippet: record.snippet,
    domPath: record.domPath,
    location: record.location,
  }
}

/**
 * A pragmatic accessible-name computation. Not the full accname algorithm —
 * it covers the sources that actually appear in generated markup, and errs
 * toward finding a name so the rules under-report rather than cry wolf.
 */
export function accessibleName(el: Element, doc: Document): string {
  const ariaLabel = el.getAttribute('aria-label')?.trim()
  if (ariaLabel) return ariaLabel

  const labelledBy = el.getAttribute('aria-labelledby')
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => doc.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ')
    if (text) return text
  }

  const text = el.textContent?.trim()
  if (text) return text

  // An icon-only control is often named by an image or SVG inside it.
  const img = el.querySelector('img[alt]')
  const alt = img?.getAttribute('alt')?.trim()
  if (alt) return alt

  const svgTitle = el.querySelector('svg > title')?.textContent?.trim()
  if (svgTitle) return svgTitle

  const title = el.getAttribute('title')?.trim()
  if (title) return title

  return ''
}

export function hasFormLabel(el: Element, doc: Document): boolean {
  if (accessibleName(el, doc)) return true
  if (el.closest('label')) return true
  const id = el.getAttribute('id')
  if (id) {
    const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id
    if (doc.querySelector(`label[for="${escaped}"]`)) return true
  }
  return false
}

export function isHidden(el: Element, view: Window): boolean {
  if (el.getAttribute('aria-hidden') === 'true') return true
  const style = view.getComputedStyle(el)
  return style.display === 'none' || style.visibility === 'hidden'
}

/** Elements whose text we should measure for contrast — leaf-ish text holders. */
export function hasOwnText(el: Element): boolean {
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0) {
      return true
    }
  }
  return false
}

export function byRule(records: ElementRecord[], selector: string): ElementRecord[] {
  return records.filter((r) => {
    try {
      return r.el.matches(selector)
    } catch {
      return false
    }
  })
}
