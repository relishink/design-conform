import type { Finding, Rule } from '../types'
import { accessibleName, byRule, finding, hasFormLabel, hasOwnText, isHidden } from './util'
import { contrastRatio, isLargeText, parseColor, resolveBackground } from '../contrast'

const INTERACTIVE = 'a[href], button, input, select, textarea, [tabindex], [role="button"]'

export const a11yRules: Rule[] = [
  {
    id: 'img-alt',
    title: 'Images have alt text',
    category: 'Accessibility',
    severity: 'error',
    wcag: '1.1.1 Non-text Content (A)',
    rationale:
      'An image with no alt attribute is announced as its filename, or skipped entirely. Either way the information in it is lost.',
    remedy:
      'Add alt text describing what the image conveys in context. If it is purely decorative, use alt="" so it is skipped deliberately rather than by accident.',
    run: ({ elements }) =>
      byRule(elements, 'img:not([alt])').map((r) =>
        finding('img-alt', 'error', 'This image has no alt attribute.', r),
      ),
  },

  {
    id: 'color-contrast',
    title: 'Text meets AA contrast',
    category: 'Accessibility',
    severity: 'error',
    wcag: '1.4.3 Contrast (Minimum) (AA)',
    rationale:
      'Text below 4.5:1 against its background (3:1 for large text) is unreadable for many people, and unreadable for everyone in bright light.',
    remedy:
      'Use a semantic pair from the theme — base-content on base-100, primary-content on primary — rather than picking a color by eye.',
    run: ({ elements, doc }) => {
      const view = doc.defaultView
      if (!view) return []
      const findings: Finding[] = []

      for (const record of elements) {
        if (!hasOwnText(record.el)) continue
        if (isHidden(record.el, view)) continue
        // <option> rendering is controlled by the OS, not the author's CSS.
        if (record.tag === 'option') continue

        const style = view.getComputedStyle(record.el)
        const fg = parseColor(style.color)
        if (!fg) continue

        const background = resolveBackground(record.el, view)
        if (background.kind === 'unresolvable') {
          findings.push(
            finding(
              'color-contrast',
              'review',
              `Contrast could not be measured automatically because ${background.reason}. Check this pair by hand.`,
              record,
            ),
          )
          continue
        }

        const foreground = fg.a < 1 ? { ...fg } : fg
        const composited =
          foreground.a < 1
            ? {
                r: foreground.r * foreground.a + background.color.r * (1 - foreground.a),
                g: foreground.g * foreground.a + background.color.g * (1 - foreground.a),
                b: foreground.b * foreground.a + background.color.b * (1 - foreground.a),
                a: 1,
              }
            : foreground

        const ratio = contrastRatio(composited, background.color)
        const large = isLargeText(style)
        const required = large ? 3 : 4.5

        if (ratio >= required) continue

        // A gradient over the measured colour can move the real ratio either
        // way, so report it as something to look at rather than a hard failure.
        findings.push(
          background.approximate
            ? finding(
                'color-contrast',
                'review',
                `Contrast measures ${ratio.toFixed(2)}:1 against the background colour, below the ${required}:1 needed for ${large ? 'large' : 'normal'} text — but a gradient is painted over it, so check this pair by hand.`,
                record,
              )
            : finding(
                'color-contrast',
                'error',
                `Contrast is ${ratio.toFixed(2)}:1 against its background, below the ${required}:1 needed for ${large ? 'large' : 'normal'} text.`,
                record,
              ),
        )
      }

      return findings
    },
  },

  {
    id: 'form-label',
    title: 'Form controls have labels',
    category: 'Accessibility',
    severity: 'error',
    wcag: '3.3.2 Labels or Instructions (A)',
    rationale:
      'A placeholder disappears the moment someone types, and is not a label to a screen reader. Without a real label the field is an unnamed box.',
    remedy:
      'Add a visible <label for> pointing at the control’s id, or wrap the control in its label.',
    run: ({ elements, doc }) =>
      byRule(elements, 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea')
        .filter((r) => !hasFormLabel(r.el, doc))
        .map((r) =>
          finding('form-label', 'error', 'This form control has no associated label.', r),
        ),
  },

  {
    id: 'button-name',
    title: 'Buttons have a name',
    category: 'Accessibility',
    severity: 'error',
    wcag: '4.1.2 Name, Role, Value (A)',
    rationale:
      'An icon-only button with no accessible name is announced as just "button", which tells nobody what it does.',
    remedy: 'Add visible text, or aria-label when the button is icon-only.',
    run: ({ elements, doc }) =>
      byRule(elements, 'button, [role="button"]')
        .filter((r) => !accessibleName(r.el, doc))
        .map((r) => finding('button-name', 'error', 'This button has no accessible name.', r)),
  },

  {
    id: 'link-name',
    title: 'Links have meaningful text',
    category: 'Accessibility',
    severity: 'error',
    wcag: '2.4.4 Link Purpose (In Context) (A)',
    rationale:
      'Screen reader users often navigate by pulling up a list of links. "Click here" repeated eight times is a useless list.',
    remedy: 'Write link text that describes the destination on its own.',
    run: ({ elements, doc }) => {
      const vague = new Set(['click here', 'here', 'read more', 'more', 'link', 'this'])
      return byRule(elements, 'a[href]').flatMap((r) => {
        const name = accessibleName(r.el, doc)
        if (!name) {
          return [finding('link-name', 'error', 'This link has no accessible text.', r)]
        }
        if (vague.has(name.toLowerCase())) {
          return [
            finding(
              'link-name',
              'warning',
              `Link text “${name}” does not describe where it goes.`,
              r,
            ),
          ]
        }
        return []
      })
    },
  },

  {
    id: 'heading-order',
    title: 'Heading levels do not skip',
    category: 'Accessibility',
    severity: 'warning',
    wcag: '1.3.1 Info and Relationships (A)',
    rationale:
      'Headings are the table of contents screen reader users navigate by. A jump from h1 to h3 implies a missing section.',
    remedy: 'Use the next level down. Style the size with a utility class if it needs to look smaller.',
    run: ({ elements }) => {
      const headings = byRule(elements, 'h1, h2, h3, h4, h5, h6')
      const findings: Finding[] = []
      let previous = 0
      for (const record of headings) {
        const level = Number(record.tag.slice(1))
        if (previous !== 0 && level > previous + 1) {
          findings.push(
            finding(
              'heading-order',
              'warning',
              `Heading level jumps from h${previous} to h${level}.`,
              record,
            ),
          )
        }
        previous = level
      }
      return findings
    },
  },

  {
    id: 'page-has-h1',
    title: 'The screen has one top-level heading',
    category: 'Accessibility',
    severity: 'warning',
    wcag: '2.4.6 Headings and Labels (AA)',
    rationale:
      'The h1 names the screen. Without one, the page opens with no announced subject; with several, none of them is the subject.',
    remedy: 'Give the screen exactly one h1 that names what it is.',
    run: ({ elements }) => {
      const h1s = byRule(elements, 'h1')
      if (h1s.length === 1) return []
      if (h1s.length === 0) {
        const first = elements[0]
        if (!first) return []
        return [
          finding('page-has-h1', 'warning', 'This screen has no h1 to name it.', first),
        ]
      }
      return h1s
        .slice(1)
        .map((r) =>
          finding(
            'page-has-h1',
            'warning',
            `This screen has ${h1s.length} h1 headings; it should have one.`,
            r,
          ),
        )
    },
  },

  {
    id: 'landmark-main',
    title: 'Primary content sits in a main landmark',
    category: 'Accessibility',
    severity: 'warning',
    wcag: '1.3.1 Info and Relationships (A)',
    rationale:
      'A <main> landmark is how keyboard and screen reader users skip the navigation to reach the content.',
    remedy: 'Wrap the screen’s primary content in a <main> element.',
    run: ({ elements }) => {
      if (byRule(elements, 'main, [role="main"]').length > 0) return []
      const first = elements[0]
      if (!first) return []
      return [
        finding(
          'landmark-main',
          'warning',
          'No <main> landmark, so there is nothing to skip to.',
          first,
        ),
      ]
    },
  },

  {
    id: 'positive-tabindex',
    title: 'No positive tabindex',
    category: 'Accessibility',
    severity: 'error',
    wcag: '2.4.3 Focus Order (A)',
    rationale:
      'A positive tabindex pulls an element to the front of the tab order for the whole page, so focus jumps around unpredictably.',
    remedy: 'Use tabindex="0" to make something focusable, or reorder the markup to change focus order.',
    run: ({ elements }) =>
      elements
        .filter((r) => Number(r.el.getAttribute('tabindex')) > 0)
        .map((r) =>
          finding(
            'positive-tabindex',
            'error',
            `tabindex="${r.el.getAttribute('tabindex')}" overrides the natural focus order.`,
            r,
          ),
        ),
  },

  {
    id: 'clickable-non-interactive',
    title: 'Clickable elements are keyboard-operable',
    category: 'Accessibility',
    severity: 'error',
    wcag: '2.1.1 Keyboard (A)',
    rationale:
      'A div with a click handler cannot be reached by Tab or fired by Enter, so the action simply does not exist for keyboard users.',
    remedy: 'Use a real <button>. If the markup must stay a div, add role="button", tabindex="0" and key handling.',
    run: ({ elements }) =>
      elements
        .filter((r) => {
          if (!r.el.hasAttribute('onclick')) return false
          if (r.el.matches('a[href], button, input, select, textarea')) return false
          return !r.el.hasAttribute('tabindex')
        })
        .map((r) =>
          finding(
            'clickable-non-interactive',
            'error',
            `<${r.tag}> has a click handler but cannot be focused or activated by keyboard.`,
            r,
          ),
        ),
  },

  {
    id: 'duplicate-id',
    title: 'Element ids are unique',
    category: 'Accessibility',
    severity: 'error',
    wcag: '4.1.1 Parsing / 1.3.1 (A)',
    rationale:
      'Duplicate ids break label-for and aria-describedby associations — the reference resolves to whichever element came first.',
    remedy: 'Make each id unique within the screen.',
    run: ({ elements }) => {
      const seen = new Map<string, number>()
      const findings: Finding[] = []
      for (const record of elements) {
        const id = record.el.getAttribute('id')
        if (!id) continue
        const count = (seen.get(id) ?? 0) + 1
        seen.set(id, count)
        if (count > 1) {
          findings.push(
            finding('duplicate-id', 'error', `The id “${id}” is used more than once.`, record),
          )
        }
      }
      return findings
    },
  },

  {
    id: 'target-size',
    title: 'Touch targets are at least 24×24',
    category: 'Accessibility',
    severity: 'warning',
    wcag: '2.5.8 Target Size (Minimum) (AA, WCAG 2.2)',
    rationale:
      'Controls under 24×24 CSS pixels are hard to hit accurately with a finger or an imprecise pointer.',
    remedy:
      'Increase padding, or wrap the control in a label so the label’s area becomes part of the target.',
    run: ({ elements, doc }) => {
      const view = doc.defaultView
      if (!view) return []
      return byRule(elements, INTERACTIVE)
        .filter((r) => !isHidden(r.el, view))
        // A wrapping label already provides a larger target for the control.
        .filter((r) => !r.el.closest('label'))
        .flatMap((r) => {
          const rect = r.el.getBoundingClientRect()
          if (rect.width === 0 && rect.height === 0) return []
          if (rect.width >= 24 && rect.height >= 24) return []
          return [
            finding(
              'target-size',
              'warning',
              `This control is ${Math.round(rect.width)}×${Math.round(rect.height)} pixels, under the 24×24 minimum.`,
              r,
            ),
          ]
        })
    },
  },
]
