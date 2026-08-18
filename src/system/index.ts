import type { ComponentCategory, SystemComponent } from './types'
import { actionComponents } from './components/actions'
import { dataInputComponents } from './components/data-input'
import { dataDisplayComponents } from './components/data-display'
import { navigationComponents } from './components/navigation'
import { feedbackComponents } from './components/feedback'
import { layoutComponents } from './components/layout'

/**
 * The approved library. This array is the source of truth for three surfaces:
 * the catalog renders it, the AI system prompt is generated from it, and the
 * checker measures generated markup against it. Add a component here and all
 * three pick it up.
 */
export const registry: SystemComponent[] = [
  ...actionComponents,
  ...dataInputComponents,
  ...dataDisplayComponents,
  ...navigationComponents,
  ...feedbackComponents,
  ...layoutComponents,
]

export const categoryOrder: ComponentCategory[] = [
  'Actions',
  'Data input',
  'Data display',
  'Navigation',
  'Feedback',
  'Layout',
]

const byId = new Map(registry.map((c) => [c.id, c]))

export function getComponent(id: string): SystemComponent | undefined {
  return byId.get(id)
}

/**
 * class token -> component id. Built once from `registry`, so a component's
 * marker classes never drift from what the checker looks for.
 */
export const markerClassMap: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>()
  for (const component of registry) {
    for (const cls of component.detect) {
      if (!map.has(cls)) map.set(cls, component.id)
    }
  }
  return map
})()

export function componentsByCategory(): { category: ComponentCategory; components: SystemComponent[] }[] {
  return categoryOrder
    .map((category) => ({
      category,
      components: registry.filter((c) => c.category === category),
    }))
    .filter((group) => group.components.length > 0)
}

export * from './types'
export * from './tokens'
