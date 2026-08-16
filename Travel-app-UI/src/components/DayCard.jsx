import ActivityCard from './ActivityCard'

const SLOTS = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
  { key: 'night', label: 'Night' },
]

// Small line-icons per time of day, used in place of stock photography.
const SLOT_ICONS = {
  morning: (
    <path d="M12 3v3M4.2 10a7.8 7.8 0 1115.6 0M2 10h20M2 14h20M6 18h12" strokeLinecap="round" />
  ),
  afternoon: (
    <>
      <circle cx="12" cy="10" r="4" />
      <path d="M12 3v1.5M4.2 10H2.7M21.3 10h-1.5M6 4.6l1 1M18 4.6l-1 1M2 18h20" strokeLinecap="round" />
    </>
  ),
  evening: (
    <path d="M4.2 12a7.8 7.8 0 0115.6 0M2 16h20M2 12h1M21 12h1" strokeLinecap="round" />
  ),
  night: (
    <path d="M20 13.5A8 8 0 1110.5 4a6.3 6.3 0 009.5 9.5z" strokeLinejoin="round" />
  ),
}

const DAY_TYPE_LABEL = {
  arrival: 'Arrival day',
  departure: 'Departure day',
}

export default function DayCard({ day }) {
  // day.date comes from the backend as a formatted calendar date, e.g.
  // "15 August 2026". Older/sample data may only have a numeric day, so
  // fall back gracefully.
  const heading = day.date || `Day ${day.day}`
  const dayTypeLabel = DAY_TYPE_LABEL[day.day_type]

  return (
    <div className="border border-sand-200 rounded-lg p-6 sm:p-8">
      <div className="flex items-baseline justify-between flex-wrap gap-x-4 gap-y-2 mb-2">
        <h3 className="font-display font-semibold text-2xl text-ink">{heading}</h3>
        <div className="flex items-center gap-3">
          {dayTypeLabel && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-clay-dark bg-clay/10 rounded px-2.5 py-1">
              {dayTypeLabel}
            </span>
          )}
          <span className="text-xs uppercase tracking-wide text-ink-500">Day {day.day}</span>
        </div>
      </div>
      <p className="text-sm text-ink-500 mb-6">{day.theme}</p>
      <div className="h-px bg-sand-200 mb-8" />

      {/* Journey line: a continuous route connecting each part of the day,
          mirroring the flight-path motif introduced in the Hero. */}
      <div className="relative pl-8">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-clay/30" />

        <div className="space-y-10">
          {SLOTS.map(({ key, label }) => {
            const activities = day.activities?.[key]
            if (!activities || activities.length === 0) return null

            return (
              <div key={key} className="relative">
                <span className="absolute -left-8 top-0.5 w-5 h-5 rounded-full bg-forest text-cream-50 flex items-center justify-center border-2 border-cream-50 shadow">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                    {SLOT_ICONS[key]}
                  </svg>
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-forest mb-3">
                  {label}
                </p>
                <div className="space-y-4">
                  {activities.map((activity, i) => (
                    <ActivityCard key={i} activity={activity} slot={key} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
