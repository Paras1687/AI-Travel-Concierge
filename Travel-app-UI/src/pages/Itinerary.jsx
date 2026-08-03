import { useLocation } from 'react-router-dom'
import sampleItinerary from '../data/sampleItinerary.json'
import TripSummary from '../components/TripSummary'
import DayCard from '../components/DayCard'
import RestaurantCard from '../components/RestaurantCard'
import HotelCard from '../components/HotelCard'
import TravelTips from '../components/TravelTips'
import Gallery from '../components/Gallery'

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-route-dark">{eyebrow}</p>
      <h2 className="font-display font-semibold text-2xl text-navy-900 mt-1">{title}</h2>
    </div>
  )
}

export default function Itinerary() {
  const location = useLocation()

  // BACKEND INTEGRATION POINT:
  // Once the backend is live, prefer the itinerary passed via router state
  // (set on the Loading page after the real API responds) and only fall
  // back to the local sample JSON for demos/dev.
  const itinerary = location.state?.itinerary || sampleItinerary

  const allRestaurants = itinerary.days.flatMap((d) => d.restaurants || [])
  const lastHotel = itinerary.days[itinerary.days.length - 1]?.hotel

  return (
    <div className="container-page py-12 space-y-16">
      <TripSummary summary={itinerary.trip_summary} />

      <section>
        <SectionHeading eyebrow="Day by day" title="Your Itinerary" />
        <div className="space-y-8">
          {itinerary.days.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Where to eat" title="Recommended Restaurants" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allRestaurants.map((restaurant, i) => (
            <RestaurantCard key={i} restaurant={restaurant} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Where to stay" title="Hotel Recommendation" />
        <HotelCard hotel={lastHotel} />
      </section>

      <section>
        <SectionHeading eyebrow="Good to know" title="Travel Tips" />
        <TravelTips tips={itinerary.travel_tips} />
      </section>

      <section>
        <SectionHeading eyebrow="Sneak peek" title="Gallery" />
        <Gallery images={itinerary.gallery} />
      </section>
    </div>
  )
}
