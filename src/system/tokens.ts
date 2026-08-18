import type { TokenScale } from './types'

/**
 * The token scales the checker measures against. Utility classes outside these
 * scales — and any arbitrary value like `p-[13px]` — are drift.
 */

export const spacingScale: TokenScale = {
  id: 'spacing',
  name: 'Spacing scale',
  description:
    'Padding, margin and gap use the Tailwind spacing steps. Arbitrary pixel values break vertical rhythm across screens built by different people.',
  values: [
    '0', 'px', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7',
    '8', '9', '10', '11', '12', '14', '16', '20', '24', '28', '32', '36', '40',
    '44', '48', '52', '56', '60', '64', '72', '80', '96', 'auto',
  ],
}

export const typeScale: TokenScale = {
  id: 'type',
  name: 'Type scale',
  description:
    'Font sizes come from the named scale. Arbitrary sizes produce headings that are almost — but not quite — a level.',
  values: [
    'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl',
    '8xl', '9xl',
  ],
}

/**
 * Semantic color roles. A prototype should reference the role, not the value,
 * so a theme change moves every screen at once.
 */
export const colorScale: TokenScale = {
  id: 'color',
  name: 'Color roles',
  description:
    'Colors reference semantic roles rather than literal values. A raw hex or an arbitrary color class pins a screen to one theme.',
  values: [
    'primary', 'primary-content',
    'secondary', 'secondary-content',
    'accent', 'accent-content',
    'neutral', 'neutral-content',
    'base-100', 'base-200', 'base-300', 'base-content',
    'info', 'info-content',
    'success', 'success-content',
    'warning', 'warning-content',
    'error', 'error-content',
    'transparent', 'current', 'inherit',
  ],
}

export const tokenScales: TokenScale[] = [spacingScale, typeScale, colorScale]

/** Utility prefixes that draw from the spacing scale. */
export const spacingPrefixes = [
  'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe',
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me',
  'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
]

/** Utility prefixes that draw from the color scale. */
export const colorPrefixes = [
  'bg', 'text', 'border', 'ring', 'fill', 'stroke', 'from', 'via', 'to',
  'divide', 'outline', 'shadow', 'accent', 'caret', 'decoration',
]
