import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { loadSettings, saveSettings } from '../storage/settings'

const navItems = [
  { to: '/library', label: 'Library' },
  { to: '/prototypes', label: 'Prototypes' },
  { to: '/standards', label: 'Standards' },
  { to: '/settings', label: 'Settings' },
]

export default function AppShell() {
  const [theme, setTheme] = useState(() => loadSettings().theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    saveSettings({ ...loadSettings(), theme })
  }, [theme])

  return (
    <div className="flex min-h-full flex-col">
      <header className="navbar bg-base-100 border-base-300 sticky top-0 z-30 border-b">
        <div className="navbar-start">
          <NavLink to="/library" className="btn btn-ghost text-lg font-semibold">
            Design&nbsp;Conform
          </NavLink>
        </div>
        <div className="navbar-center hidden md:flex">
          <nav aria-label="Primary">
            <ul className="menu menu-horizontal gap-1 px-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => (isActive ? 'menu-active' : '')}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="navbar-end gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Light' : 'Dark'} theme
          </button>
        </div>
      </header>

      <nav aria-label="Primary" className="border-base-300 border-b md:hidden">
        <ul className="menu menu-horizontal w-full justify-around">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => (isActive ? 'menu-active' : '')}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
