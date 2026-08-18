import type { SourceLocation } from './types'

interface SourceTag {
  name: string
  line: number
  column: number
}

/**
 * Scan raw markup for opening tags in source order, recording where each starts.
 * This is deliberately not a parser — it only needs enough fidelity to hand a
 * designer a line number they can point an engineer at.
 */
export function scanOpeningTags(source: string): SourceTag[] {
  const tags: SourceTag[] = []
  const re = /<([a-zA-Z][a-zA-Z0-9-]*)(?=[\s/>])/g
  let match: RegExpExecArray | null

  // Precompute line starts so index -> line/column is a binary search, not a scan.
  const lineStarts: number[] = [0]
  for (let i = 0; i < source.length; i++) {
    if (source.charCodeAt(i) === 10) lineStarts.push(i + 1)
  }

  while ((match = re.exec(source)) !== null) {
    const index = match.index
    let lo = 0
    let hi = lineStarts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (lineStarts[mid] <= index) lo = mid
      else hi = mid - 1
    }
    tags.push({
      name: match[1].toLowerCase(),
      line: lo + 1,
      column: index - lineStarts[lo] + 1,
    })
  }

  return tags
}

/**
 * Walks elements and source tags in parallel. The parser inserts elements the
 * source never had (`tbody`, `head`), so an element that finds no match within
 * the lookahead window simply gets no location rather than a wrong one.
 */
export class SourceLocator {
  private tags: SourceTag[]
  private cursor = 0
  private static readonly LOOKAHEAD = 60

  constructor(source: string) {
    this.tags = scanOpeningTags(source)
  }

  locate(tagName: string): SourceLocation | undefined {
    const name = tagName.toLowerCase()
    const limit = Math.min(this.tags.length, this.cursor + SourceLocator.LOOKAHEAD)
    for (let i = this.cursor; i < limit; i++) {
      if (this.tags[i].name === name) {
        this.cursor = i + 1
        return { line: this.tags[i].line, column: this.tags[i].column }
      }
    }
    return undefined
  }
}
