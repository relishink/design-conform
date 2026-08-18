export type Severity = 'error' | 'warning' | 'review'

export type RuleCategory = 'Accessibility' | 'Design tokens' | 'Component usage'

/** A source location in the prototype markup, 1-indexed. */
export interface SourceLocation {
  line: number
  column: number
}

/**
 * One element in the prototype, pre-resolved so rules don't each re-walk the
 * DOM or re-read layout. `el` is a live node in the analysis iframe — that
 * document has no script access, so reading from it is safe.
 */
export interface ElementRecord {
  el: Element
  tag: string
  classes: string[]
  /** e.g. `body > div.card > button.btn` — enough for a human to find it. */
  domPath: string
  /** Where the element's opening tag starts in the source, when we can find it. */
  location?: SourceLocation
  /** The opening tag, trimmed for display. */
  snippet: string
}

export interface RuleContext {
  doc: Document
  elements: ElementRecord[]
  source: string
}

export interface Finding {
  ruleId: string
  severity: Severity
  /** What is wrong, in a sentence a designer can act on. */
  message: string
  snippet: string
  domPath: string
  location?: SourceLocation
}

export interface Rule {
  id: string
  title: string
  category: RuleCategory
  severity: Severity
  /** WCAG 2.2 success criterion, where one applies. */
  wcag?: string
  /** Why this matters — shown on the Standards page. */
  rationale: string
  /** What to do about it — shown on the Standards page. */
  remedy: string
  run(ctx: RuleContext): Finding[]
}

export interface ComponentUse {
  componentId: string
  componentName: string
  instances: { domPath: string; snippet: string; location?: SourceLocation }[]
}

export interface DriftUse {
  /** Stable id for the kind of drift, e.g. `custom-button`. */
  id: string
  label: string
  /** The library component this should have been, when we can attribute it. */
  suggestedComponentId?: string
  reason: string
  instances: { domPath: string; snippet: string; location?: SourceLocation }[]
}

export interface CheckReport {
  onSystem: ComponentUse[]
  offSystem: DriftUse[]
  findings: Finding[]
  summary: {
    onSystemCount: number
    offSystemCount: number
    errors: number
    warnings: number
    reviews: number
    passedRuleIds: string[]
  }
  checkedAt: string
}
