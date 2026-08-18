import { useEffect, useState } from 'react'

interface Props {
  value: string
  label?: string
  className?: string
}

export default function CopyButton({ value, label = 'Copy', className = 'btn btn-sm' }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Clipboard is unavailable over plain http or without permission.
      // Fall back to selecting the text so the user can copy it themselves.
      window.prompt('Copy to clipboard: Ctrl/Cmd + C, then Enter', value)
    }
  }

  return (
    <button type="button" className={className} onClick={copy}>
      {copied ? 'Copied' : label}
    </button>
  )
}
