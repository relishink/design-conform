import { useMemo, useState } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import { componentsByCategory, getComponent, registry } from '../system'
import type { SystemComponent } from '../system'
import CodeBlock from '../components/CodeBlock'

export default function Library() {
  const { componentId } = useParams()
  const selected = componentId ? getComponent(componentId) : undefined
  const missing = Boolean(componentId && !selected)

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-8 px-4">
      <LibraryNav />
      <div className="min-w-0 flex-1 py-6">
        {missing ? (
          <>
            <div role="alert" className="alert alert-error">
              <span>No component with the id “{componentId}” is in the library.</span>
            </div>
            <Link to="/library" className="btn mt-4">
              Back to the library
            </Link>
          </>
        ) : selected ? (
          <ComponentDetail component={selected} />
        ) : (
          <Catalog />
        )}
      </div>
    </div>
  )
}

/**
 * Persistent index of the library, grouped the way the registry is. Built with
 * our own Menu component rather than bespoke markup — the app should pass its
 * own checker.
 */
function LibraryNav() {
  const groups = componentsByCategory()

  return (
    // Hidden on small screens, where the catalog grid and breadcrumbs already
    // carry navigation and a 224px rail would eat half the viewport.
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav
        aria-label="Component library"
        className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-6"
      >
        {/* NavLink sets aria-current="page" on the active link by itself, so the
            "mark the current item" rule is satisfied without doing it here. */}
        <ul className="menu w-full p-0">
          <li>
            <NavLink
              to="/library"
              end
              className={({ isActive }) => (isActive ? 'menu-active font-medium' : '')}
            >
              All components
              <span className="badge badge-xs badge-ghost ml-auto">{registry.length}</span>
            </NavLink>
          </li>

          {groups.map((group) => (
            <li key={group.category}>
              <h2 className="menu-title px-3 pt-4 pb-1 text-xs">{group.category}</h2>
              <ul className="m-0 border-none p-0">
                {group.components.map((component) => (
                  <li key={component.id}>
                    <NavLink
                      to={`/library/${component.id}`}
                      className={({ isActive }) => (isActive ? 'menu-active font-medium' : '')}
                    >
                      {component.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

function Catalog() {
  const [query, setQuery] = useState('')
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return componentsByCategory()
      .map((group) => ({
        ...group,
        components: q
          ? group.components.filter(
              (c) =>
                c.name.toLowerCase().includes(q) ||
                c.summary.toLowerCase().includes(q) ||
                c.detect.some((d) => d.includes(q)),
            )
          : group.components,
      }))
      .filter((group) => group.components.length > 0)
  }, [query])

  const total = groups.reduce((n, g) => n + g.components.length, 0)

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Component library</h1>
        <p className="text-base-content/70 mt-2 max-w-2xl">
          The approved set. This is the same registry the checker measures generated prototypes
          against and the same list your AI is told to prefer — so what you see here is literally
          what counts as on-system.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          className="input w-full max-w-xs"
          placeholder="Filter components"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter components"
        />
        <span className="text-base-content/60 text-sm">
          {total} of {registry.length} components
        </span>
      </div>

      {total === 0 && (
        <div role="alert" className="alert">
          Nothing matches “{query}”. Try a component name or a class like <code>btn</code>.
        </div>
      )}

      {groups.map((group) => (
        <section key={group.category} className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">{group.category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.components.map((component) => (
              <ComponentCard key={component.id} component={component} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function ComponentCard({ component }: { component: SystemComponent }) {
  return (
    <Link
      to={`/library/${component.id}`}
      className="card card-border bg-base-100 hover:border-primary focus-visible:border-primary transition-colors"
    >
      <div className="card-body gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-base">{component.name}</h3>
          <span className="badge badge-sm badge-ghost font-mono">.{component.detect[0]}</span>
        </div>
        <p className="text-base-content/70 text-sm">{component.summary}</p>
        {/* Fixed height so a row of cards stays level regardless of how big the
            variant is — a ragged grid reads as broken. */}
        <div className="border-base-300 bg-base-200 rounded-box mt-auto flex h-28 items-center justify-center overflow-hidden border p-4">
          <Preview html={component.variants[0].previewHtml ?? component.variants[0].html} />
        </div>
      </div>
    </Link>
  )
}

function ComponentDetail({ component }: { component: SystemComponent }) {
  const [variantIndex, setVariantIndex] = useState(0)
  const variant = component.variants[variantIndex]

  return (
    <div className="max-w-4xl">
      <nav aria-label="Breadcrumb" className="breadcrumbs mb-2 text-sm">
        <ul>
          <li>
            <Link to="/library">Library</Link>
          </li>
          <li>{component.category}</li>
          <li aria-current="page">{component.name}</li>
        </ul>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl font-bold">{component.name}</h1>
        <p className="text-base-content/70 mt-2">{component.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {component.detect.map((cls) => (
            <span key={cls} className="badge badge-outline font-mono">
              .{cls}
            </span>
          ))}
        </div>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Variants</h2>
        {component.variants.length > 1 && (
          <div role="tablist" className="tabs tabs-box mb-4 w-fit">
            {component.variants.map((v, i) => (
              <button
                key={v.name}
                role="tab"
                aria-selected={i === variantIndex}
                className={`tab ${i === variantIndex ? 'tab-active' : ''}`}
                onClick={() => setVariantIndex(i)}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        {variant.description && (
          <p className="text-base-content/70 mb-3 text-sm">{variant.description}</p>
        )}

        <div className="border-base-300 bg-base-200 rounded-box mb-3 flex min-h-32 items-center justify-center overflow-auto border p-6">
          <Preview html={variant.previewHtml ?? variant.html} />
        </div>

        <CodeBlock code={variant.html} />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xl font-semibold">Usage</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {component.usage.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold">Accessibility</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {component.a11yNotes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

/**
 * Catalog previews are first-party markup from the registry, not model output,
 * so they render inline and inherit the app's stylesheet. Untrusted prototype
 * markup goes through the sandboxed iframes in PrototypeFrame instead.
 */
function Preview({ html }: { html: string }) {
  return <div className="w-full" dangerouslySetInnerHTML={{ __html: html }} />
}
