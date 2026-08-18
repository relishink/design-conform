/**
 * Yields the JSON payload of each `data:` line in a Server-Sent Events stream.
 * Chunk boundaries land anywhere, so partial lines are carried across reads.
 */
export async function* readDataLines(response: Response): AsyncGenerator<string> {
  const body = response.body
  if (!body) throw new Error('The provider returned an empty response body.')

  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let newline: number
      while ((newline = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newline).trim()
        buffer = buffer.slice(newline + 1)
        if (line.startsWith('data:')) {
          yield line.slice(5).trim()
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const text = await response.text()
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } }
      if (parsed.error?.message) return parsed.error.message
    } catch {
      // Not JSON — fall through to the raw text.
    }
    if (text) return text.slice(0, 400)
  } catch {
    // Body already consumed or unreadable.
  }
  return fallback
}
