import { examplePrototypes } from '../examples'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface Prototype {
  id: string
  title: string
  html: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  /** Bundled examples are read-only so the demo cannot be edited away. */
  readOnly?: boolean
  description?: string
}

const KEY = 'design-conform:prototypes'

function exampleAsPrototype(): Prototype[] {
  return examplePrototypes.map((example) => ({
    id: example.id,
    title: example.title,
    description: example.description,
    html: example.html,
    messages: [],
    createdAt: '',
    updatedAt: '',
    readOnly: true,
  }))
}

function readStored(): Prototype[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Prototype[]) : []
  } catch {
    return []
  }
}

function writeStored(items: Prototype[]): void {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function listPrototypes(): Prototype[] {
  const stored = readStored().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return [...stored, ...exampleAsPrototype()]
}

export function getPrototype(id: string): Prototype | undefined {
  return listPrototypes().find((p) => p.id === id)
}

export function createPrototype(title: string): Prototype {
  const now = new Date().toISOString()
  const prototype: Prototype = {
    id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim() || 'Untitled prototype',
    html: '',
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
  writeStored([prototype, ...readStored()])
  return prototype
}

export function savePrototype(prototype: Prototype): void {
  if (prototype.readOnly) return
  const stored = readStored()
  const index = stored.findIndex((p) => p.id === prototype.id)
  const next = { ...prototype, updatedAt: new Date().toISOString() }
  if (index === -1) stored.unshift(next)
  else stored[index] = next
  writeStored(stored)
}

export function deletePrototype(id: string): void {
  writeStored(readStored().filter((p) => p.id !== id))
}

/** Copy a bundled example into editable storage so it can be iterated on. */
export function forkPrototype(source: Prototype): Prototype {
  const now = new Date().toISOString()
  const copy: Prototype = {
    id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: `${source.title.replace(/\s*\((on-system|drifted)\)$/, '')} copy`,
    html: source.html,
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
  writeStored([copy, ...readStored()])
  return copy
}
