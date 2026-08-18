import CopyButton from './CopyButton'

interface Props {
  code: string
  label?: string
}

export default function CodeBlock({ code, label = 'Copy code' }: Props) {
  return (
    <div className="relative">
      {/* Right padding keeps long lines from running under the copy button. */}
      <pre className="bg-base-300 text-base-content rounded-box max-h-80 overflow-auto p-4 pr-28 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton value={code} label={label} className="btn btn-xs" />
      </div>
    </div>
  )
}
