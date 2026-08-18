import type { Rule, RuleCategory } from '../types'
import { a11yRules } from './a11y'
import { tokenRules } from './tokens'

/**
 * Every rule the checker runs. The Standards page renders this same array, so
 * documentation cannot drift from behaviour: adding a rule here publishes it.
 */
export const rules: Rule[] = [...a11yRules, ...tokenRules]

export const ruleCategoryOrder: RuleCategory[] = [
  'Accessibility',
  'Design tokens',
  'Component usage',
]

const byId = new Map(rules.map((r) => [r.id, r]))

export function getRule(id: string): Rule | undefined {
  return byId.get(id)
}

export function rulesByCategory(): { category: RuleCategory; rules: Rule[] }[] {
  return ruleCategoryOrder
    .map((category) => ({ category, rules: rules.filter((r) => r.category === category) }))
    .filter((group) => group.rules.length > 0)
}
