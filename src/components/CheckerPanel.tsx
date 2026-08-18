import { Link } from 'react-router-dom'
import { getRule } from '../checker/rules'
import { buildFindingsPrompt, buildFixPrompt } from '../checker/fixPrompt'
import type { CheckReport, Finding, Severity } from '../checker/types'
import CopyButton from './CopyButton'

interface Props {
  report: CheckReport | null
  error: string | null
  running: boolean
  onSendToAi?: (prompt: string) => void
}

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

export default function CheckerPanel({ report, error, running, onSendToAi }: Props) {
  if (error) {
    return (
      <div className="p-6">
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (running || !report) {
    return (
      <div className="text-base-content/70 flex items-center gap-3 p-6">
        <span className="loading loading-spinner" aria-hidden="true"></span>
        <span role="status">Checking the prototype…</span>
      </div>
    )
  }

  const { summary } = report
  const total = summary.onSystemCount + summary.offSystemCount
  const onSystemPct = total === 0 ? 0 : Math.round((summary.onSystemCount / total) * 100)

  return (
    <div className="flex flex-col gap-8 p-6">
      <section>
        <div className="stats stats-vertical sm:stats-horizontal border-base-300 w-full border">
          <div className="stat">
            <div className="stat-title">On-system</div>
            <div className="stat-value text-success">{summary.onSystemCount}</div>
            <div className="stat-desc">
              {total === 0 ? 'nothing detected yet' : `${onSystemPct}% of detected components`}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Off-system</div>
            <div className={`stat-value ${summary.offSystemCount ? 'text-error' : ''}`}>
              {summary.offSystemCount}
            </div>
            <div className="stat-desc">
              {summary.offSystemCount === 0 ? 'no drift found' : 'each has a fix prompt below'}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Accessibility</div>
            <div className={`stat-value ${summary.errors ? 'text-error' : 'text-success'}`}>
              {summary.errors}
            </div>
            <div className="stat-desc">
              {summary.errors === 0 ? 'no errors' : 'errors'} · {summary.warnings} warning
              {summary.warnings === 1 ? '' : 's'}
              {summary.reviews > 0 && ` · ${summary.reviews} to review`}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">Off-system components</h2>
          {report.offSystem.length > 0 && (
            <span className="badge badge-error">{report.offSystem.length} kinds</span>
          )}
        </div>

        {report.offSystem.length === 0 ? (
          <div role="alert" className="alert alert-success">
            <span>Every component detected in this prototype is part of the approved library.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {report.offSystem.map((drift) => {
              const prompt = buildFixPrompt(drift)
              return (
                <article key={drift.id} className="card card-border bg-base-100">
                  <div className="card-body gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="card-title text-base">{drift.label}</h3>
                      <span className="badge badge-sm badge-error">
                        {drift.instances.length} instance
                        {drift.instances.length === 1 ? '' : 's'}
                      </span>
                      {drift.suggestedComponentId && (
                        <Link
                          to={`/library/${drift.suggestedComponentId}`}
                          className="link link-primary ml-auto text-sm"
                        >
                          View the approved component
                        </Link>
                      )}
                    </div>

                    <p className="text-sm">{drift.reason}</p>

                    <InstanceList instances={drift.instances} />

                    <div className="collapse-arrow bg-base-200 collapse">
                      <input type="checkbox" />
                      <div className="collapse-title text-sm font-semibold">
                        Fix prompt — paste this into your AI
                      </div>
                      <div className="collapse-content">
                        <pre className="bg-base-300 rounded-box max-h-64 overflow-auto p-3 text-xs whitespace-pre-wrap">
                          {prompt}
                        </pre>
                        <div className="mt-2 flex gap-2">
                          <CopyButton value={prompt} label="Copy prompt" className="btn btn-sm" />
                          {onSendToAi && (
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => onSendToAi(prompt)}
                            >
                              Send to AI
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">On-system components</h2>
        {report.onSystem.length === 0 ? (
          <p className="text-base-content/70 text-sm">
            No library components were detected in this prototype.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Uses</th>
                  <th>Where</th>
                </tr>
              </thead>
              <tbody>
                {report.onSystem.map((use) => (
                  <tr key={use.componentId}>
                    <td>
                      <Link to={`/library/${use.componentId}`} className="link">
                        {use.componentName}
                      </Link>
                    </td>
                    <td>{use.instances.length}</td>
                    <td className="text-base-content/70 font-mono text-xs">
                      {use.instances
                        .slice(0, 4)
                        .map((i) => (i.location ? `L${i.location.line}` : i.domPath))
                        .join(', ')}
                      {use.instances.length > 4 && ` +${use.instances.length - 4}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">Accessibility &amp; tokens</h2>
          {report.findings.length > 0 && (
            <>
              <span className="badge">{report.findings.length} findings</span>
              <div className="ml-auto flex gap-2">
                <CopyButton
                  value={buildFindingsPrompt(report.findings)}
                  label="Copy fix-all prompt"
                  className="btn btn-sm"
                />
                {onSendToAi && (
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => onSendToAi(buildFindingsPrompt(report.findings))}
                  >
                    Send to AI
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {report.findings.length === 0 ? (
          <div role="alert" className="alert alert-success">
            <span>
              All {summary.passedRuleIds.length} rules passed against this prototype.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {report.findings.map((finding, index) => (
              <FindingRow key={`${finding.ruleId}-${index}`} finding={finding} />
            ))}
          </div>
        )}

        <p className="text-base-content/60 mt-4 text-sm">
          {summary.passedRuleIds.length} of {summary.passedRuleIds.length + new Set(report.findings.map((f) => f.ruleId)).size}{' '}
          rules passed. <Link to="/standards" className="link">See what each rule checks</Link>.
        </p>
      </section>
    </div>
  )
}

function InstanceList({
  instances,
}: {
  instances: { domPath: string; snippet: string; location?: { line: number; column: number } }[]
}) {
  return (
    <ul className="flex flex-col gap-1 text-xs">
      {instances.slice(0, 5).map((instance, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-2">
          <span className="badge badge-xs badge-ghost font-mono">
            {instance.location ? `line ${instance.location.line}` : 'location unknown'}
          </span>
          <code className="text-base-content/70 truncate">{instance.snippet}</code>
        </li>
      ))}
      {instances.length > 5 && (
        <li className="text-base-content/60">…and {instances.length - 5} more.</li>
      )}
    </ul>
  )
}

function FindingRow({ finding }: { finding: Finding }) {
  const rule = getRule(finding.ruleId)
  return (
    <article className="border-base-300 rounded-box border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge badge-sm ${severityBadge[finding.severity]}`}>
          {severityLabel[finding.severity]}
        </span>
        <span className="font-semibold">{rule?.title ?? finding.ruleId}</span>
        {finding.location && (
          <span className="badge badge-sm badge-ghost font-mono">line {finding.location.line}</span>
        )}
        <code className="text-base-content/50 ml-auto text-xs">{finding.ruleId}</code>
      </div>
      <p className="mt-2 text-sm">{finding.message}</p>
      {finding.snippet && (
        <code className="text-base-content/60 mt-1 block truncate text-xs">{finding.snippet}</code>
      )}
      {rule && (
        <p className="mt-2 text-sm">
          <span className="font-semibold">Fix:</span> {rule.remedy}
        </p>
      )}
    </article>
  )
}
