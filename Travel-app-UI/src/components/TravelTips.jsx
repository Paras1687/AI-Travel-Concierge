export default function TravelTips({ tips }) {
  if (!tips || tips.length === 0) return null

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {tips.map((tip, i) => (
        <div
          key={i}
          className="flex gap-3 bg-white rounded-2xl shadow-card p-5 hover:shadow-soft transition-shadow"
        >
          <span className="shrink-0 w-7 h-7 rounded-full bg-route/10 text-route-dark font-display font-semibold text-sm flex items-center justify-center">
            {i + 1}
          </span>
          <p className="text-sm text-navy-900/80 leading-relaxed">{tip}</p>
        </div>
      ))}
    </div>
  )
}
