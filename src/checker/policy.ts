import type { RuleCategory, Severity } from './types'

/**
 * Component usage is not evaluated by a rule module — it falls out of comparing
 * the markup against the registry directly, and is reported in the components
 * section rather than as findings. It is documented here so the Standards page
 * describes the whole standard rather than only the parts with rule files.
 */
export const componentUsagePolicy: {
  id: string
  title: string
  category: RuleCategory
  severity: Severity
  rationale: string
  remedy: string
  detects: string[]
} = {
  id: 'approved-component-usage',
  title: 'Screens are built from approved components',
  category: 'Component usage',
  severity: 'warning',
  rationale:
    'A hand-rolled copy of a library component starts life looking identical and then diverges — it misses the states, focus handling and sizing the real component already solved, and nobody notices until it is in production.',
  remedy:
    'Replace the custom markup with the library component. Every off-system item in a report comes with a prompt you can paste back into your AI to do exactly that.',
  detects: [
    'Elements carrying a library marker class are counted as on-system uses of that component.',
    'Elements that behave like a library component but omit its marker class — a bare <button>, an unstyled <input>, a div with role="button" — are reported as drift and attributed to the component they should have been.',
    'Bordered, padded containers holding their own content are reported as hand-rolled cards.',
  ],
}
