import WeatherCard from './WeatherCard'

const stat = (label, value) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate">{label}</p>
    <p className="font-display font-semibold text-navy-900 text-lg">{value}</p>
  </div>
)

export default function TripSummary({ summary }) {
  if (!summary) return null

  return (
    <section className="bg-white rounded-2xl shadow-card p-6 sm:p-8 grid sm:grid-cols-[1fr_auto] gap-8 items-center">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {stat('Destination', summary.destination)}
        {stat('Duration', `${summary.days} days`)}
        {stat('Budget', summary.budget)}
        {stat('Travel Style', summary.travel_style)}
      </div>
      <WeatherCard weather={summary.weather} compact />
    </section>
  )
}
