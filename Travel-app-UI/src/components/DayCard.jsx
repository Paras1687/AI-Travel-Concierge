import ActivityCard from './ActivityCard'

const SLOTS = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
  { key: 'night', label: 'Night' },
]

export default function DayCard({ day }) {
  return (
    <div className="bg-mist/60 rounded-3xl p-6 sm:p-8">
      <div className="flex items-baseline gap-3 mb-8">
        <span className="font-display text-3xl font-semibold text-route-dark">
          {String(day.day).padStart(2, '0')}
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate">Day {day.day}</p>
          <h3 className="font-display font-semibold text-xl text-navy-900">{day.theme}</h3>
        </div>
      </div>

      {/* Journey line: a continuous route connecting each part of the day,
          mirroring the flight-path motif introduced in the Hero. */}
      <div className="relative pl-8">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-route/30" />

        <div className="space-y-10">
          {SLOTS.map(({ key, label }) => {
            const activities = day.activities?.[key]
            if (!activities || activities.length === 0) return null

            return (
              <div key={key} className="relative">
                <span className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-route border-2 border-white shadow" />
                <p className="text-xs font-semibold uppercase tracking-wider text-route-dark mb-3">
                  {label}
                </p>
                <div className="space-y-4">
                  {activities.map((activity, i) => (
                    <ActivityCard key={i} activity={activity} />
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
