export interface Rgb {
  r: number
  g: number
  b: number
  a: number
}

let colorContext: CanvasRenderingContext2D | null | undefined

function getColorContext(): CanvasRenderingContext2D | null {
  if (colorContext !== undefined) return colorContext
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  colorContext = canvas.getContext('2d', { willReadFrequently: true })
  return colorContext
}

const colorCache = new Map<string, Rgb | null>()

/**
 * Resolve any CSS color to sRGB by painting one pixel and reading it back.
 *
 * daisyUI emits `oklch()`, and computed styles hand it straight through, so a
 * regex over `rgb()` silently matches nothing and every contrast check quietly
 * passes. Rather than hand-rolling oklch -> sRGB (and lab, and color(), and
 * named colors), let the browser's own parser do it.
 */
export function parseColor(value: string): Rgb | null {
  if (!value) return null
  const cached = colorCache.get(value)
  if (cached !== undefined) return cached

  const ctx = getColorContext()
  if (!ctx) return null

  // Assigning an unparseable color leaves fillStyle at its previous value. Try
  // it against two different seeds: if both land on the same result the color
  // was understood; if each keeps its seed, it was not.
  ctx.fillStyle = '#000000'
  ctx.fillStyle = value
  const fromBlack = ctx.fillStyle
  ctx.fillStyle = '#ffffff'
  ctx.fillStyle = value
  if (ctx.fillStyle !== fromBlack) {
    colorCache.set(value, null)
    return null
  }

  ctx.clearRect(0, 0, 1, 1)
  ctx.fillRect(0, 0, 1, 1)

  let data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, 0, 1, 1).data
  } catch {
    colorCache.set(value, null)
    return null
  }

  const result: Rgb = { r: data[0], g: data[1], b: data[2], a: data[3] / 255 }
  colorCache.set(value, result)
  return result
}

function channelLuminance(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  return (
    0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
  )
}

/** Composite a translucent foreground over an opaque background. */
export function flatten(fg: Rgb, bg: Rgb): Rgb {
  const a = fg.a
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1,
  }
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [light, dark] = la > lb ? [la, lb] : [lb, la]
  return (light + 0.05) / (dark + 0.05)
}

export type BackgroundResolution =
  /**
   * `approximate` means a gradient or image was painted over the solid colour we
   * measured. daisyUI layers a subtle gradient on most components, so treating
   * that as unmeasurable would blind the rule to nearly the whole library; the
   * underlying colour is the right approximation, flagged as one.
   */
  | { kind: 'resolved'; color: Rgb; approximate: boolean }
  /** An image with nothing solid behind it — no single ratio exists to report. */
  | { kind: 'unresolvable'; reason: string }

/**
 * Walk up until an opaque background is found, compositing translucent layers on
 * the way.
 */
export function resolveBackground(el: Element, view: Window): BackgroundResolution {
  let node: Element | null = el
  let accumulated: Rgb | null = null
  let approximate = false

  while (node) {
    const style = view.getComputedStyle(node)
    const hasImage = Boolean(style.backgroundImage && style.backgroundImage !== 'none')
    const bg = parseColor(style.backgroundColor)

    if (hasImage) {
      if (bg && bg.a >= 1) {
        const color = accumulated ? flatten(accumulated, bg) : bg
        return { kind: 'resolved', color: { ...color, a: 1 }, approximate: true }
      }
      return {
        kind: 'unresolvable',
        reason: 'a background image or gradient sits behind this text with no solid colour under it',
      }
    }

    if (bg && bg.a > 0) {
      accumulated = accumulated ? flatten(accumulated, bg) : bg
      if (bg.a >= 1) {
        return { kind: 'resolved', color: { ...accumulated, a: 1 }, approximate }
      }
    }

    node = node.parentElement
  }

  // Nothing opaque anywhere up the tree: the canvas is white.
  const white: Rgb = { r: 255, g: 255, b: 255, a: 1 }
  return {
    kind: 'resolved',
    color: accumulated ? flatten(accumulated, white) : white,
    approximate,
  }
}

/** WCAG 1.4.3 treats >=24px, or >=18.66px bold, as large text. */
export function isLargeText(style: CSSStyleDeclaration): boolean {
  const size = parseFloat(style.fontSize)
  if (Number.isNaN(size)) return false
  const weight = parseInt(style.fontWeight, 10)
  const bold = !Number.isNaN(weight) && weight >= 700
  return size >= 24 || (bold && size >= 18.66)
}
