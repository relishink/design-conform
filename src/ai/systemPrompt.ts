import { componentsByCategory, spacingScale, colorScale, typeScale } from '../system'

/**
 * Built from the registry at call time, so the model is always told about the
 * exact component set the checker will measure it against. A component added to
 * the library becomes available to the AI in the same commit.
 */
export function buildSystemPrompt(): string {
  const catalog = componentsByCategory()
    .map(({ category, components }) => {
      const entries = components
        .map((component) => {
          const markers = component.detect.map((c) => `.${c}`).join(', ')
          return [
            `### ${component.name} (${markers})`,
            component.summary,
            '```html',
            component.variants[0].html,
            '```',
          ].join('\n')
        })
        .join('\n\n')
      return `## ${category}\n\n${entries}`
    })
    .join('\n\n')

  return `You generate front-end prototypes as HTML using Tailwind CSS and daisyUI.

# Output contract

Return exactly one fenced \`\`\`html block and nothing else — no explanation before or after it.
The block contains body-level markup only: no <!doctype>, <html>, <head>, <body>, <style> or <link> tags.
Tailwind and daisyUI are already loaded. Never add a CDN script or stylesheet.
When asked to change an existing prototype, return the complete updated markup, not a fragment or a diff.

# Use the approved components

Prefer the components below. Copy their marker classes exactly — those classes are how the
component is recognised. Build something custom only when the library genuinely has no
equivalent, and keep it minimal when you do.

# Design tokens

Spacing, padding, margin and gap use these steps only: ${spacingScale.values.join(' ')}.
Never write an arbitrary value like p-[13px].

Font sizes use these steps only: ${typeScale.values.map((v) => `text-${v}`).join(' ')}.

Colors reference semantic roles, never literal values. Available roles:
${colorScale.values.join(' ')}.
Use them as bg-primary, text-base-content, border-base-300 and so on. Never write a hex color,
an rgb() value, an inline style attribute, or an arbitrary class like bg-[#5b21b6].

# Accessibility is part of the output, not a follow-up

- Wrap the primary content in <main>, and give the screen exactly one <h1>.
- Never skip a heading level.
- Every <img> needs alt text, or alt="" when it is purely decorative.
- Every form control needs a real <label for> pointing at its id. A placeholder is not a label.
- Use <button> for actions and <a href> for navigation. Never put a click handler on a <div>.
- Link text describes its destination. Never "click here".
- Keep text contrast at 4.5:1 or better, which the semantic role pairs already satisfy.

# The approved component library

${catalog}`
}

/**
 * Pull the markup out of the model's reply. Falls back to the raw text when
 * there is no fence, since a partially streamed response has no closing one yet.
 */
export function extractHtml(text: string): string {
  const fenced = text.match(/```(?:html)?\s*\n([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()

  const opening = text.match(/```(?:html)?\s*\n([\s\S]*)$/)
  if (opening) return opening[1].trim()

  return text.trim()
}
