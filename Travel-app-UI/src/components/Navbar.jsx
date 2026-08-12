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
        <Link to="/" className="flex items-center gap-2 group">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-clay-dark group-hover:-translate-y-0.5 transition-transform"
          >
            {/* Compass rose mark */}
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
            <path d="M12 7l1.8 3.7L17.5 12l-3.7 1.3L12 17l-1.8-3.7L6.5 12l3.7-1.3L12 7z" fill="currentColor" />
          </svg>
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
