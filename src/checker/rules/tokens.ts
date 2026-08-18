import type { Finding, Rule } from '../types'
import { finding } from './util'
import { colorPrefixes, colorScale, spacingPrefixes, spacingScale, typeScale } from '../../system'

/** `p-[13px]`, `text-[#5b21b6]`, `gap-[7px]` — a value invented at the call site. */
const ARBITRARY = /^-?([a-z][a-z0-9-]*)-\[(.+)]$/

/** Strip responsive and state prefixes: `md:hover:p-4` -> `p-4`. */
function baseUtility(cls: string): string {
  const parts = cls.split(':')
  return parts[parts.length - 1]
}

function splitUtility(cls: string): { prefix: string; value: string } | null {
  const idx = cls.lastIndexOf('-')
  if (idx <= 0) return null
  return { prefix: cls.slice(0, idx), value: cls.slice(idx + 1) }
}

const spacingPrefixSet = new Set(spacingPrefixes)
const spacingValues = new Set(spacingScale.values)
const typeValues = new Set(typeScale.values)
const colorPrefixSet = new Set(colorPrefixes)
const colorValues = new Set(colorScale.values)

const LITERAL_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/

export const tokenRules: Rule[] = [
  {
    id: 'spacing-scale',
    title: 'Spacing comes from the scale',
    category: 'Design tokens',
    severity: 'warning',
    rationale:
      'A one-off value like p-[13px] looks fine alone and wrong beside everything built to the scale. This is how rhythm decays across a product.',
    remedy: 'Use the nearest step on the spacing scale — p-3 or p-4 rather than p-[13px].',
    run: ({ elements }) => {
      const findings: Finding[] = []
      for (const record of elements) {
        for (const raw of record.classes) {
          const cls = baseUtility(raw)
          const arbitrary = cls.match(ARBITRARY)
          if (arbitrary && spacingPrefixSet.has(arbitrary[1])) {
            findings.push(
              finding(
                'spacing-scale',
                'warning',
                `“${raw}” sets spacing to an arbitrary value instead of a step on the scale.`,
                record,
              ),
            )
            continue
          }
          const split = splitUtility(cls)
          if (split && spacingPrefixSet.has(split.prefix) && !spacingValues.has(split.value)) {
            // Fractional and negative steps still resolve to the scale; anything
            // else is a value Tailwind will not have generated from our tokens.
            if (!/^\d+(\.\d+)?$/.test(split.value)) continue
            findings.push(
              finding(
                'spacing-scale',
                'warning',
                `“${raw}” is not a step on the spacing scale.`,
                record,
              ),
            )
          }
        }
      }
      return findings
    },
  },

  {
    id: 'color-token',
    title: 'Colors reference a semantic role',
    category: 'Design tokens',
    severity: 'warning',
    rationale:
      'A literal color pins the screen to one theme. Change the brand or ship a dark mode and every hard-coded value has to be hunted down by hand.',
    remedy:
      'Use a role from the theme — bg-primary, text-base-content, border-base-300 — instead of a hex value or an arbitrary color class.',
    run: ({ elements }) => {
      const findings: Finding[] = []
      for (const record of elements) {
        const style = record.el.getAttribute('style')
        if (style && LITERAL_COLOR.test(style)) {
          findings.push(
            finding(
              'color-token',
              'warning',
              'An inline style sets a literal color rather than referencing a theme role.',
              record,
            ),
          )
        }

        for (const raw of record.classes) {
          const cls = baseUtility(raw)
          const arbitrary = cls.match(ARBITRARY)
          if (arbitrary && colorPrefixSet.has(arbitrary[1]) && LITERAL_COLOR.test(arbitrary[2])) {
            findings.push(
              finding(
                'color-token',
                'warning',
                `“${raw}” hard-codes a color instead of referencing a theme role.`,
                record,
              ),
            )
          }
        }
      }
      return findings
    },
  },

  {
    id: 'type-scale',
    title: 'Font sizes come from the type scale',
    category: 'Design tokens',
    severity: 'warning',
    rationale:
      'Arbitrary font sizes produce headings that are almost a level — close enough to look like a mistake, far enough to break the hierarchy.',
    remedy: 'Use a named size such as text-lg or text-2xl.',
    run: ({ elements }) => {
      const findings: Finding[] = []
      for (const record of elements) {
        for (const raw of record.classes) {
          const cls = baseUtility(raw)
          const arbitrary = cls.match(ARBITRARY)
          if (arbitrary && arbitrary[1] === 'text' && /^[\d.]+(px|rem|em|pt)$/.test(arbitrary[2])) {
            findings.push(
              finding(
                'type-scale',
                'warning',
                `“${raw}” sets an arbitrary font size instead of a step on the type scale.`,
                record,
              ),
            )
            continue
          }
          if (cls.startsWith('text-')) {
            const value = cls.slice('text-'.length)
            // `text-*` is overloaded: size, color role, and alignment all share it.
            const isSizeLike = /^(\d|xs$|sm$|base$|lg$|xl$|\d+xl$)/.test(value)
            if (isSizeLike && !typeValues.has(value) && !colorValues.has(value)) {
              findings.push(
                finding(
                  'type-scale',
                  'warning',
                  `“${raw}” is not a step on the type scale.`,
                  record,
                ),
              )
            }
          }
        }
      }
      return findings
    },
  },
]
