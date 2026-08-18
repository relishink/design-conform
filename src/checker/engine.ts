import type { CheckReport, Finding } from './types'
import { withAnalysisDocument } from './frame'
import { walk } from './walker'
import { scanComponents } from './componentScan'
import { rules } from './rules'

const severityRank = { error: 0, warning: 1, review: 2 } as const

export async function runCheck(html: string, theme = 'light'): Promise<CheckReport> {
  return withAnalysisDocument(
    html,
    (doc) => {
      const elements = walk(doc, html)
      const { onSystem, offSystem } = scanComponents(elements)

      const findings: Finding[] = []
      const passedRuleIds: string[] = []

      for (const rule of rules) {
        let produced: Finding[] = []
        try {
          produced = rule.run({ doc, elements, source: html })
        } catch (error) {
          // One broken rule must not take the whole report down — report it as a
          // finding against itself so the failure is visible rather than silent.
          produced = [
            {
              ruleId: rule.id,
              severity: 'review',
              message: `This rule could not run: ${error instanceof Error ? error.message : String(error)}`,
              snippet: '',
              domPath: '',
            },
          ]
        }
        if (produced.length === 0) passedRuleIds.push(rule.id)
        findings.push(...produced)
      }

      findings.sort((a, b) => {
        const bySeverity = severityRank[a.severity] - severityRank[b.severity]
        if (bySeverity !== 0) return bySeverity
        return (a.location?.line ?? 0) - (b.location?.line ?? 0)
      })

      const count = (s: Finding['severity']) => findings.filter((f) => f.severity === s).length

      return {
        onSystem,
        offSystem,
        findings,
        summary: {
          onSystemCount: onSystem.reduce((n, u) => n + u.instances.length, 0),
          offSystemCount: offSystem.reduce((n, u) => n + u.instances.length, 0),
          errors: count('error'),
          warnings: count('warning'),
          reviews: count('review'),
          passedRuleIds,
        },
        checkedAt: new Date().toISOString(),
      }
    },
    theme,
  )
}
