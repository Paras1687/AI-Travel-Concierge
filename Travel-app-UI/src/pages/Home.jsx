import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'

export default function Home() {
  const navigate = useNavigate()

  const handleGenerate = (prompt) => {
    // BACKEND INTEGRATION POINT:
    // Replace this navigation with something like:
    //   const res = await fetch('/api/itinerary', {
    //     method: 'POST',
    //     body: JSON.stringify({ prompt }),
    //   })
    //   const data = await res.json()
    // and pass `data` through router state (or a shared store) instead of
    // letting the Itinerary page fall back to the local sample JSON.
    navigate('/loading', { state: { prompt } })
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
            title: 'AI builds the plan',
            copy: 'Attractions, restaurants, and stays are matched and arranged into a day-by-day route.',
          },
          {
            title: 'Review and go',
            copy: 'Browse a clear itinerary with timings, tips, and a gallery of what to expect.',
          },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-6">
            <span className="font-display text-route-dark font-semibold">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="font-display font-semibold text-lg text-navy-900 mt-2">{item.title}</h3>
            <p className="text-sm text-slate mt-2 leading-relaxed">{item.copy}</p>
          </div>
        ))}
      </section>
    </>
  )
}
