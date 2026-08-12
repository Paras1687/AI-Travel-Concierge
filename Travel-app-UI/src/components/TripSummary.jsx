import WeatherCard from './WeatherCard'

const stat = (label, value) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
    <p className="font-display font-semibold text-ink text-lg mt-0.5">{value}</p>
  </div>
)

// Backend sends ISO dates ("2026-08-15"); display them the same way the
// date picker and day-by-day timeline do.
function formatDisplayDate(isoDate) {
  if (!isoDate) return null
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TripSummary({ summary }) {
  if (!summary) return null

  const hasDateRange = Boolean(summary.start_date && summary.end_date)
  const dateRangeLabel = hasDateRange
    ? `${formatDisplayDate(summary.start_date)} - ${formatDisplayDate(summary.end_date)}`
    : null

  return (
    <section className="relative bg-paper rounded-2xl shadow-card border border-sand-200">
      {/* Boarding-pass style stub cutouts */}
      <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-cream-50 border border-sand-200" />
      <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full bg-cream-50 border border-sand-200" />

      <div className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-clay-dark mb-5">Trip Overview</p>

        <div className="grid sm:grid-cols-[1fr_auto] gap-6 sm:gap-8 items-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stat('Destination', summary.destination)}
            {hasDateRange
              ? stat('Travel dates', dateRangeLabel)
              : stat('Travel style', summary.travel_style)}
            {stat('Duration', `${summary.days} Days`)}
            {stat('Budget', summary.budget)}
          </div>

          <div
            className="hidden sm:block self-stretch"
            style={{ width: '1px', backgroundImage: 'repeating-linear-gradient(180deg, #D8C8A2 0, #D8C8A2 6px, transparent 6px, transparent 14px)' }}
          />

          <WeatherCard weather={summary.weather} compact />
        </div>
      </div>
    </section>
  )
}
