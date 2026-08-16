import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const linkClasses = (path) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'text-clay-dark'
        : 'text-ink-700/70 hover:text-ink'
    }`

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-cream-50/90 border-b border-ink/10">
      <nav className="container-page flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="AI Travel Concierge Logo"
            className="w-8 h-8 object-contain rounded-lg group-hover:scale-105 transition-transform"
          />
          <span className="font-display font-semibold text-lg tracking-tight text-ink">
            AI Travel Concierge
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className={linkClasses('/')}>
            Home
          </Link>
          <Link to="/itinerary" className={linkClasses('/itinerary')}>
            Itinerary
          </Link>
        </div>
      </nav>
    </header>
  )
}
