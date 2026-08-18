import { rules, rulesByCategory } from '../checker/rules'
import { componentUsagePolicy } from '../checker/policy'
import { tokenScales } from '../system'
import type { Severity } from '../checker/types'

const severityBadge: Record<Severity, string> = {
  error: 'badge-error',
  warning: 'badge-warning',
  review: 'badge-ghost',
}

const severityLabel: Record<Severity, string> = {
  error: 'Error',
  warning: 'Warning',
  review: 'Needs review',
}

export default function Standards() {
  const groups = rulesByCategory()

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">The standards</h1>
        <p className="text-base-content/70 mt-2 max-w-2xl">
          Every rule below is a module the checker executes. This page renders that same list, so
          what is documented here and what runs against your prototypes cannot drift apart.
        </p>
        <div className="stats stats-horizontal border-base-300 mt-4 border">
          <div className="stat">
            <div className="stat-title">Executable rules</div>
            <div className="stat-value text-3xl">{rules.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Categories</div>
            <div className="stat-value text-3xl">{groups.length + 1}</div>
          </div>
        </div>
      </header>

      {groups.map((group) => (
        <section key={group.category} className="mb-10">
          <h2 className="mb-1 text-xl font-semibold">{group.category}</h2>
          <p className="text-base-content/60 mb-4 text-sm">
            {group.rules.length} rule{group.rules.length === 1 ? '' : 's'}
          </p>
          <div className="flex flex-col gap-3">
            {group.rules.map((rule) => (
              <article key={rule.id} className="card card-border bg-base-100">
                <div className="card-body gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="card-title text-base">{rule.title}</h3>
                    <span className={`badge badge-sm ${severityBadge[rule.severity]}`}>
                      {severityLabel[rule.severity]}
                    </span>
                    <code className="text-base-content/60 ml-auto text-xs">{rule.id}</code>
                  </div>
                  {rule.wcag && (
                    <p className="text-base-content/60 text-xs">WCAG {rule.wcag}</p>
                  )}
                  <p className="text-sm">{rule.rationale}</p>
                  <p className="text-sm">
                    <span className="font-semibold">Fix:</span> {rule.remedy}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="mb-10">
        <h2 className="mb-1 text-xl font-semibold">{componentUsagePolicy.category}</h2>
        <p className="text-base-content/60 mb-4 text-sm">
          Reported in the components section of a report rather than as findings.
        </p>
        <article className="card card-border bg-base-100">
          <div className="card-body gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="card-title text-base">{componentUsagePolicy.title}</h3>
              <span className={`badge badge-sm ${severityBadge[componentUsagePolicy.severity]}`}>
                {severityLabel[componentUsagePolicy.severity]}
              </span>
              <code className="text-base-content/60 ml-auto text-xs">
                {componentUsagePolicy.id}
              </code>
            </div>
            <p className="text-sm">{componentUsagePolicy.rationale}</p>
            <p className="text-sm">
              <span className="font-semibold">Fix:</span> {componentUsagePolicy.remedy}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {componentUsagePolicy.detects.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Token scales</h2>
        <div className="flex flex-col gap-3">
          {tokenScales.map((scale) => (
            <article key={scale.id} className="card card-border bg-base-100">
              <div className="card-body gap-2">
                <h3 className="card-title text-base">{scale.name}</h3>
                <p className="text-sm">{scale.description}</p>
                <div className="flex flex-wrap gap-1">
                  {scale.values.map((value) => (
                    <code key={value} className="badge badge-sm badge-ghost font-mono">
                      {value}
                    </code>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
