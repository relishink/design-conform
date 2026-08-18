import { useEffect, useMemo, useRef } from 'react'
import { buildDocument } from '../checker/frame'

interface Props {
  html: string
  theme?: string
  className?: string
}

/**
 * The visible preview. It runs the prototype's scripts, so it deliberately does
 * NOT get `allow-same-origin` — without it, nothing inside can reach this app's
 * DOM, storage, or the user's API key. The checker reads the markup from a
 * separate, script-free frame instead (see checker/frame.ts).
 */
export default function PrototypeFrame({ html, theme = 'light', className = '' }: Props) {
  const ref = useRef<HTMLIFrameElement>(null)
  const doc = useMemo(() => buildDocument(html, theme), [html, theme])

  useEffect(() => {
    const frame = ref.current
    if (frame) frame.srcdoc = doc
  }, [doc])

  return (
    <iframe
      ref={ref}
      title="Prototype preview"
      sandbox="allow-scripts allow-forms allow-popups allow-modals"
      className={`bg-base-100 w-full border-0 ${className}`}
    />
  )
}
