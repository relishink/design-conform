import type { ElementRecord } from './types'
import { SourceLocator } from './sourceMap'

/** Elements that carry no design intent worth reporting on. */
const SKIP = new Set(['html', 'head', 'meta', 'title', 'style', 'script', 'link', 'base'])

function shortPathSegment(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const cls = Array.from(el.classList)[0]
  return cls ? `${tag}.${cls}` : tag
}

function buildDomPath(el: Element): string {
  const parts: string[] = []
  let node: Element | null = el
  while (node && node.tagName.toLowerCase() !== 'html') {
    parts.unshift(shortPathSegment(node))
    node = node.parentElement
    if (parts.length >= 5) break
  }
  return parts.join(' > ')
}

/** The opening tag only — enough to recognise the element without a wall of markup. */
function openingTag(el: Element): string {
  const html = el.outerHTML
  const end = html.indexOf('>')
  const tag = end === -1 ? html : html.slice(0, end + 1)
  return tag.length > 200 ? `${tag.slice(0, 197)}…` : tag
}

export function walk(doc: Document, source: string): ElementRecord[] {
  const locator = new SourceLocator(source)
  const records: ElementRecord[] = []

  const walker = doc.createTreeWalker(doc.documentElement, NodeFilter.SHOW_ELEMENT)
  let node: Node | null = walker.currentNode

  while (node) {
    const el = node as Element
    const tag = el.tagName.toLowerCase()
    if (!SKIP.has(tag)) {
      // `body` is consumed by the locator (it exists in the wrapper document but
      // not in the prototype source) but is not itself worth reporting on.
      const location = locator.locate(tag)
      if (tag !== 'body') {
        records.push({
          el,
          tag,
          classes: Array.from(el.classList),
          domPath: buildDomPath(el),
          location,
          snippet: openingTag(el),
        })
      }
    }
    node = walker.nextNode()
  }

  return records
}
