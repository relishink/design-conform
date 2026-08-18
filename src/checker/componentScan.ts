import { markerClassMap, registry, getComponent } from '../system'
import type { ComponentUse, DriftUse, ElementRecord } from './types'

interface Instance {
  domPath: string
  snippet: string
  location?: { line: number; column: number }
}

function toInstance(record: ElementRecord): Instance {
  return { domPath: record.domPath, snippet: record.snippet, location: record.location }
}

const CONTAINER_LOOK = /^(border|shadow|rounded)/
const PADDING = /^p[xytrbles]?-/

/**
 * Classify every element as an on-system component use, drift, or neither.
 *
 * On-system is exact: the element carries one of the marker classes the registry
 * declares. Drift is deliberately conservative — we only report it where we can
 * name what it should have been, because "off-system" with no suggested fix is a
 * complaint rather than a finding.
 */
export function scanComponents(records: ElementRecord[]): {
  onSystem: ComponentUse[]
  offSystem: DriftUse[]
} {
  const uses = new Map<string, Instance[]>()
  const drift = new Map<string, { info: Omit<DriftUse, 'instances'>; instances: Instance[] }>()
  const claimed = new WeakSet<Element>()

  const addDrift = (key: string, info: Omit<DriftUse, 'instances'>, record: ElementRecord) => {
    if (claimed.has(record.el)) return
    claimed.add(record.el)
    const entry = drift.get(key) ?? { info, instances: [] }
    entry.instances.push(toInstance(record))
    drift.set(key, entry)
  }

  // Pass 1 — on-system uses.
  for (const record of records) {
    for (const cls of record.classes) {
      const componentId = markerClassMap.get(cls)
      if (componentId) {
        claimed.add(record.el)
        const list = uses.get(componentId) ?? []
        list.push(toInstance(record))
        uses.set(componentId, list)
        break // one element counts once, for the first component it matches
      }
    }
  }

  // Pass 2 — drift the registry can attribute, via each component's `expect`.
  for (const component of registry) {
    if (!component.expect?.length) continue
    const selector = component.expect.join(', ')
    for (const record of records) {
      if (claimed.has(record.el)) continue
      let matches = false
      try {
        matches = record.el.matches(selector)
      } catch {
        // A malformed selector in the registry should not take down the checker.
        continue
      }
      if (!matches) continue
      addDrift(
        `custom-${component.id}`,
        {
          id: `custom-${component.id}`,
          label: `Custom ${component.name.toLowerCase()}`,
          suggestedComponentId: component.id,
          reason: `This behaves like the ${component.name} component but does not use it, so it misses the library's states, sizing and focus handling.`,
        },
        record,
      )
    }
  }

  // Pass 3 — hand-rolled containers. An element with a border/shadow/rounded
  // treatment, padding, and real content inside it is a card someone rebuilt.
  const card = getComponent('card')
  if (card) {
    for (const record of records) {
      if (claimed.has(record.el)) continue
      if (record.tag !== 'div' && record.tag !== 'section' && record.tag !== 'article') continue
      const hasContainerLook = record.classes.some((c) => CONTAINER_LOOK.test(c))
      const hasPadding = record.classes.some((c) => PADDING.test(c))
      if (!hasContainerLook || !hasPadding) continue
      const hasContent =
        record.el.children.length >= 2 || !!record.el.querySelector('h1,h2,h3,h4,h5,h6')
      if (!hasContent) continue
      addDrift(
        'custom-card',
        {
          id: 'custom-card',
          label: 'Hand-rolled card',
          suggestedComponentId: 'card',
          reason:
            'This is a bordered, padded container holding its own content — the shape the Card component already provides. Rebuilding it by hand is how card padding and radius drift apart between screens.',
        },
        record,
      )
    }
  }

  const onSystem: ComponentUse[] = [...uses.entries()]
    .map(([componentId, instances]) => ({
      componentId,
      componentName: getComponent(componentId)?.name ?? componentId,
      instances,
    }))
    .sort((a, b) => b.instances.length - a.instances.length)

  const offSystem: DriftUse[] = [...drift.values()]
    .map((entry) => ({ ...entry.info, instances: entry.instances }))
    .sort((a, b) => b.instances.length - a.instances.length)

  return { onSystem, offSystem }
}
