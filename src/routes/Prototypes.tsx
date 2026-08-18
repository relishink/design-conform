import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createPrototype, deletePrototype, listPrototypes } from '../storage/prototypes'
import { hasKey } from '../storage/settings'

export default function Prototypes() {
  const navigate = useNavigate()
  const [items, setItems] = useState(() => listPrototypes())
  const [title, setTitle] = useState('')
  const keyPresent = hasKey()

  function create(event: React.FormEvent) {
    event.preventDefault()
    const prototype = createPrototype(title)
    navigate(`/prototypes/${prototype.id}`)
  }

  function remove(id: string) {
    deletePrototype(id)
    setItems(listPrototypes())
  }

  const mine = items.filter((p) => !p.readOnly)
  const examples = items.filter((p) => p.readOnly)

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Prototypes</h1>
        <p className="text-base-content/70 mt-2 max-w-2xl">
          Describe a screen and let your AI build it, then check what drifted off the system.
        </p>
      </header>

      {!keyPresent && (
        <div role="alert" className="alert alert-info mb-6">
          <span>
            No AI key yet, so generation is off. The examples below still work — open one to see the
            checker.{' '}
            <Link to="/settings" className="link">
              Add a key in Settings
            </Link>
            .
          </span>
        </div>
      )}

      <form onSubmit={create} className="mb-8 flex flex-wrap items-end gap-3">
        <div>
          <label className="label" htmlFor="new-prototype-title">
            New prototype
          </label>
          <input
            id="new-prototype-title"
            className="input w-72"
            placeholder="Checkout flow"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Create
        </button>
      </form>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Yours</h2>
        {mine.length === 0 ? (
          <p className="text-base-content/70 text-sm">
            Nothing yet. Create one above, or open an example to see how the checker reads a screen.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((prototype) => (
              <article key={prototype.id} className="card card-border bg-base-100">
                <div className="card-body gap-2">
                  <h3 className="card-title text-base">{prototype.title}</h3>
                  <p className="text-base-content/60 text-xs">
                    {prototype.html ? 'Generated' : 'Empty'} · updated{' '}
                    {new Date(prototype.updatedAt).toLocaleString()}
                  </p>
                  <div className="card-actions mt-2 justify-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => remove(prototype.id)}
                    >
                      Delete
                    </button>
                    <Link to={`/prototypes/${prototype.id}`} className="btn btn-sm btn-primary">
                      Open
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Examples</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {examples.map((prototype) => (
            <article key={prototype.id} className="card card-border bg-base-100">
              <div className="card-body gap-2">
                <h3 className="card-title text-base">{prototype.title}</h3>
                <p className="text-sm">{prototype.description}</p>
                <div className="card-actions mt-2 justify-end">
                  <Link to={`/prototypes/${prototype.id}`} className="btn btn-sm">
                    Open
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
