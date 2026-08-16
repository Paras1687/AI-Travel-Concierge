import WeatherCard from './WeatherCard'

const stat = (label, value, subtext) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
    <p className="font-display font-semibold text-ink text-lg mt-0.5">{value}</p>
    {subtext && <p className="text-[11px] text-forest font-medium mt-0.5">{subtext}</p>}
  </div>
)

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

  const calculateDays = (sDate, eDate) => {
    if (!sDate || !eDate) return null;
    try {
      const s = new Date(sDate);
      const e = new Date(eDate);
      const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return (isNaN(diffDays) || diffDays <= 0) ? null : diffDays;
    } catch {
      return null;
    }
  };

  const calculatedDays = calculateDays(summary.start_date, summary.end_date);
  const displayDays = calculatedDays || summary.days || 3;

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
            {stat('Duration', `${displayDays} Days`)}
            {stat('Total Est. Budget', summary.budget || 'Flexible', 'Includes Travel, Stay, Food & Activities')}
          </div>

          <div
            className="hidden sm:block self-stretch"
            style={{ width: '1px', backgroundImage: 'repeating-linear-gradient(180deg, #D8C8A2 0, #D8C8A2 6px, transparent 6px, transparent 14px)' }}
          />

        </div>

      </div>
    </section>
  )
}
