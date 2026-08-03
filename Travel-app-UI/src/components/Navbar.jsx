import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const linkClasses = (path) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'text-route-dark'
        : 'text-navy-900/70 hover:text-navy-900'
    }`

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-navy-900/5">
      <nav className="container-page flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            className="text-route-dark group-hover:rotate-12 transition-transform"
          >
            <path
              d="M12 2L4 21l8-4 8 4L12 2z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
              fill="rgba(46,196,182,0.15)"
            />
          </svg>
          <span className="font-display font-semibold text-lg tracking-tight text-navy-900">
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
