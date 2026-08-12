import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'

export default function Home() {
  const navigate = useNavigate()

  const handleGenerate = ({ prompt, startDate, endDate }) => {
    // The actual POST to the backend happens on the Loading page (it needs
    // to stay mounted while the request is in flight). We just forward the
    // free-text prompt plus the ISO start_date/end_date picked in the
    // calendar — no number_of_days is involved anywhere in this flow.
    navigate('/loading', { state: { prompt, startDate, endDate } })
  }

  return (
    <>
      <Hero onGenerate={handleGenerate} />

      <section className="container-page py-20 grid sm:grid-cols-3 gap-6">
        {[
          {
            title: 'Describe your trip',
            copy: 'Tell the concierge your destination, budget, and travel style in one sentence.',
          },
          {
            title: 'We build the plan',
            copy: 'Attractions, restaurants, and stays are matched and arranged into a day-by-day route.',
          },
          {
            title: 'Review and go',
            copy: 'Browse a clear itinerary with timings, tips, and everything you need on the road.',
          },
        ].map((item, i) => (
          <div key={i} className="bg-paper rounded-xl shadow-card p-6 border border-sand-200">
            <span className="font-display text-clay-dark font-semibold">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="font-display font-semibold text-lg text-ink mt-2">{item.title}</h3>
            <p className="text-sm text-ink-500 mt-2 leading-relaxed">{item.copy}</p>
          </div>
        ))}
      </section>
    </>
  )
}
