const icons = {
  cloud: (
    <path d="M7 18a4 4 0 010-8 5 5 0 019.6-1.5A4.5 4.5 0 0117.5 18H7z" />
  ),
  sun: <circle cx="12" cy="12" r="5" />,
  rain: (
    <path d="M7 15a4 4 0 010-8 5 5 0 019.6-1.5A4.5 4.5 0 0117.5 15H7zM8 19l-1 2M12 19l-1 2M16 19l-1 2" />
  ),
}

export default function WeatherCard({ weather, compact = false }) {
  if (!weather) return null
  const icon = icons[weather.icon] || icons.cloud

  return (
    <div
      className={`flex items-center gap-4 ${
        compact ? '' : 'bg-white rounded-2xl shadow-card p-6'
      }`}
    >
      <div className="w-14 h-14 rounded-full bg-mist flex items-center justify-center text-route-dark">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6">
          {icon}
        </svg>
      </div>
      <div>
        <p className="font-display font-semibold text-navy-900 text-lg">{weather.temperature}</p>
        <p className="text-sm text-slate">{weather.condition}</p>
      </div>
    </div>
  )
}
