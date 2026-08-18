export type ComponentCategory =
  | 'Actions'
  | 'Data input'
  | 'Data display'
  | 'Navigation'
  | 'Feedback'
  | 'Layout'

export interface ComponentVariant {
  name: string
  description?: string
  /** The canonical snippet — what gets copied, and what the AI is shown. */
  html: string
  /**
   * Rendered in the catalog instead of `html` when the real markup cannot sit
   * inline — a modal, for instance, escapes its container by design.
   */
  previewHtml?: string
}

export interface SystemComponent {
  id: string
  name: string
  category: ComponentCategory
  /** One line. Shown in the catalog and injected into the AI system prompt. */
  summary: string
  /**
   * Marker classes that identify this component in markup. An element carrying
   * any of these is counted as an on-system use of this component.
   */
  detect: string[]
  /**
   * Selectors for elements that *ought* to be this component. An element that
   * matches one of these but carries none of `detect` is reported as drift and
   * attributed here, which is what turns "custom button" into an actionable
   * fix prompt rather than an anonymous warning.
   */
  expect?: string[]
  variants: ComponentVariant[]
  usage: string[]
  a11yNotes: string[]
}

export interface TokenScale {
  id: string
  name: string
  description: string
  /** Utility class suffixes or literal values considered on-system. */
  values: string[]
}
