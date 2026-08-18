import { getComponent } from '../system'
import type { DriftUse, Finding } from './types'

/**
 * Turn a piece of drift into something you can paste straight back into your AI.
 * The prompt carries the offending markup, the approved component's canonical
 * snippet, and its usage rules — everything the model needs to rebuild it
 * on-system without another round trip.
 */
export function buildFixPrompt(drift: DriftUse): string {
  const component = drift.suggestedComponentId ? getComponent(drift.suggestedComponentId) : undefined
  const locations = drift.instances
    .map((i) => (i.location ? `line ${i.location.line}` : i.domPath))
    .join(', ')

  const lines: string[] = [
    `In the prototype, ${drift.instances.length} element${drift.instances.length === 1 ? '' : 's'} (${locations}) ${drift.instances.length === 1 ? 'is' : 'are'} off-system: ${drift.reason}`,
    '',
    'The markup in question:',
    '```html',
    ...drift.instances.slice(0, 3).map((i) => i.snippet),
    '```',
    '',
  ]

  if (component) {
    lines.push(
      `Rebuild ${drift.instances.length === 1 ? 'it' : 'them'} using the approved ${component.name} component.`,
      '',
      `Marker class${component.detect.length === 1 ? '' : 'es'}: ${component.detect.map((c) => `.${c}`).join(', ')}`,
      '',
      'Canonical markup:',
      '```html',
      component.variants[0].html,
      '```',
      '',
      'Rules for this component:',
      ...component.usage.map((u) => `- ${u}`),
      ...component.a11yNotes.map((a) => `- ${a}`),
    )
  } else {
    lines.push(
      'Rebuild it using components from the approved library rather than custom markup.',
    )
  }

  lines.push(
    '',
    'Keep the existing content and layout. Change only what is needed to bring this on-system, and return the full updated HTML.',
  )

  return lines.join('\n')
}

/** A prompt covering a batch of findings — the "fix everything" path. */
export function buildFindingsPrompt(findings: Finding[]): string {
  const grouped = new Map<string, Finding[]>()
  for (const f of findings) {
    const list = grouped.get(f.ruleId) ?? []
    list.push(f)
    grouped.set(f.ruleId, list)
  }

  const lines = ['The checker found these issues in the prototype. Fix all of them.', '']

  for (const [ruleId, group] of grouped) {
    lines.push(`## ${ruleId} (${group.length})`)
    for (const f of group.slice(0, 5)) {
      const where = f.location ? `line ${f.location.line}` : f.domPath
      lines.push(`- ${where}: ${f.message}`)
      if (f.snippet) lines.push(`  \`${f.snippet}\``)
    }
    if (group.length > 5) lines.push(`- …and ${group.length - 5} more of the same.`)
    lines.push('')
  }

  lines.push(
    'Prefer components from the approved library over custom markup, and keep the existing content and layout. Return the full updated HTML.',
  )

  return lines.join('\n')
}
