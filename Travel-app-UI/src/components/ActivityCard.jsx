const SLOT_MARK = {
  morning: { bg: 'bg-gold/15', fg: 'text-gold' },
  afternoon: { bg: 'bg-clay/15', fg: 'text-clay-dark' },
  evening: { bg: 'bg-forest/15', fg: 'text-forest' },
  night: { bg: 'bg-ink/10', fg: 'text-ink-700' },
}

export default function ActivityCard({ activity, slot = 'morning' }) {
  const mark = SLOT_MARK[slot] || SLOT_MARK.morning

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-paper rounded-xl shadow-card border border-sand-200 overflow-hidden hover:shadow-soft hover:-translate-y-0.5 transition-all">
      {activity.image ? (
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full sm:w-40 h-40 sm:h-auto object-cover"
          loading="lazy"
        />
      ) : (
        <div className={`w-full sm:w-32 h-24 sm:h-auto flex items-center justify-center ${mark.bg}`}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" className={mark.fg}>
            <path d="M12 21s-7-6.1-7-11.2A7 7 0 0112 3a7 7 0 017 6.8C19 14.9 12 21 12 21z" strokeLinejoin="round" />
            <circle cx="12" cy="9.8" r="2.2" />
          </svg>
        </div>
      )}
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h4 className="font-display font-semibold text-ink">{activity.name}</h4>
          <span className="text-xs font-medium text-clay-dark bg-clay/10 rounded-full px-3 py-1">
            {activity.time}
          </span>
        </div>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">{activity.description}</p>
        <p className="text-xs text-ink-500/70 mt-3">Est. duration: {activity.duration}</p>
      </div>
    </div>
  )
}
