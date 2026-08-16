import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TripSummary from '../components/TripSummary'
import TransportCard from '../components/TransportCard'
import BudgetBreakdown from '../components/BudgetBreakdown'
import DayCard from '../components/DayCard'
import RestaurantCard from '../components/RestaurantCard'
import CuisineSection from '../components/CuisineSection'
import HotelCard from '../components/HotelCard'
import TravelTips from '../components/TravelTips'
import Gallery from '../components/Gallery'

function SectionHeading({ eyebrow, title, badgeText }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-clay-dark">{eyebrow}</p>
        <h2 className="font-display font-semibold text-2xl text-ink mt-1">{title}</h2>
      </div>
      {badgeText && (
        <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-full bg-forest/10 text-forest border border-forest/20">
          {badgeText}
        </span>
      )}
    </div>
  )
}

function parseJsonSafely(rawStr) {
  if (!rawStr || typeof rawStr !== 'string') return null
  try {
    const cleanJson = rawStr.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    try {
      const match = rawStr.match(/\{[\s\S]*\}/)
      if (match) return JSON.parse(match[0])
    } catch (err) {
      console.warn("Could not extract JSON from itinerary string:", err)
    }
  }
  return null
}

export default function Itinerary() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedMode, setSelectedMode] = useState('flight')

  let rawItinerary = location.state?.itinerary

  if (typeof rawItinerary === 'string') {
    rawItinerary = parseJsonSafely(rawItinerary)
  }

  if (rawItinerary && rawItinerary.itinerary && typeof rawItinerary.itinerary === 'object') {
    rawItinerary = rawItinerary.itinerary
  }

  const itinerary = rawItinerary && typeof rawItinerary === 'object' ? rawItinerary : null

  if (!itinerary) {
    return (
      <div className="container-page py-20 text-center space-y-4">
        <h2 className="font-display text-2xl font-semibold text-ink">No Itinerary Selected</h2>
        <p className="text-ink-500">Please enter a travel request from the home page to generate a custom itinerary.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-forest text-cream-50 rounded-lg hover:bg-forest-dark transition-colors font-medium"
        >
          Plan a Trip Now
        </button>
      </div>
    )
  }

  const modeItineraries = itinerary.trip_summary?.mode_itineraries
  const daysList = (modeItineraries && modeItineraries[selectedMode] && modeItineraries[selectedMode].length > 0)
    ? modeItineraries[selectedMode]
    : (Array.isArray(itinerary?.days) ? itinerary.days : [])

  const allRestaurants = daysList.flatMap((d) => (Array.isArray(d?.restaurants) ? d.restaurants : []))
  const lastHotel = daysList[daysList.length - 1]?.hotel || daysList[0]?.hotel

  const dest = itinerary.trip_summary?.destination || itinerary.destination || 'Kashmir';
  const destLower = dest.toLowerCase();

  // Dynamic travel tips cleaning & clothing guide fallback
  let tipsList = Array.isArray(itinerary?.travel_tips) ? [...itinerary.travel_tips] : [];
  
  // Clean any old hardcoded "16 Sep" or "departs null" strings
  tipsList = tipsList.map(t => {
    if (typeof t === 'string' && (t.includes('16 Sep') || t.includes('departs null') || t.includes('Rajdhani Express'))) {
      const orig = itinerary?.trip_summary?.origin || 'Delhi';
      return `Outbound & Return Transit Schedule: Express transit departs ${orig} in alignment with standard 02:00 PM hotel check-in.`;
    }
    return t;
  });

  // Ensure clothing guide is present
  if (!tipsList.some(t => typeof t === 'string' && t.includes('Clothing & Packing'))) {
    if (destLower.includes('kashmir') || destLower.includes('srinagar') || destLower.includes('gulmarg') || destLower.includes('manali') || destLower.includes('mussoorie') || destLower.includes('kedarnath')) {
      tipsList.push("🧥 Clothing & Packing Guide: Cold mountain climate. Pack heavy woolens, thermal innerwear, windproof/waterproof jacket, warm socks, fleece liners, and lip balm.");
    } else if (destLower.includes('goa') || destLower.includes('kerala') || destLower.includes('munnar')) {
      tipsList.push("🏖️ Clothing & Packing Guide: Tropical beach climate. Pack light breathable cottons, linen shirts, swimwear, UV sunglasses, SPF 50+ sunscreen, and flip-flops.");
    } else {
      tipsList.push("👕 Clothing & Packing Guide: Comfortable climate. Pack versatile layered clothing, sun hat, sunglasses, and comfortable walking shoes.");
    }
  }

  // Ensure local cuisines are present
  let localCuisines = itinerary?.local_cuisines || itinerary?.trip_summary?.local_cuisines;
  if (!Array.isArray(localCuisines) || localCuisines.length === 0) {
    if (destLower.includes('kashmir') || destLower.includes('srinagar') || destLower.includes('gulmarg')) {
      localCuisines = [
        { name: "Wazwan Royal Banquet", type: "Traditional Feast", desc: "Authentic 36-course Kashmiri feast featuring Rogan Josh, Gushtaba, Rista, and Tabak Maaz." },
        { name: "Kashmiri Kahwa Tea", type: "Beverage", desc: "Green tea infused with saffron strands, crushed almonds, cardamom, and cinnamon." },
        { name: "Modur Pulao & Yakhni", type: "Main Course", desc: "Fragrant saffron sweet rice garnished with dry fruits paired with mild yogurt mutton curry." },
        { name: "Nadir Monji & Sheermal", type: "Snacks & Bread", desc: "Crispy lotus stem fritters served with saffron-infused traditional bakery flatbread." }
      ];
    } else if (destLower.includes('goa')) {
      localCuisines = [
        { name: "Goan Fish Curry Rice", type: "Coastal Specialty", desc: "Fresh catch cooked in spicy coconut & red chili gravy served with local boiled rice." },
        { name: "Pork Vindaloo & Sorpotel", type: "Heritage Dish", desc: "Tangy, vinegary, and spicy Portuguese-inspired classic meat curry." },
        { name: "Bebinca & Dodol", type: "Dessert", desc: "Traditional multi-layered Goan coconut milk & jaggery pudding." },
        { name: "Sol Kadi & Fresh Coconut Water", type: "Beverage", desc: "Refreshing digestive drink made with kokum extract and fresh coconut milk." }
      ];
    } else {
      localCuisines = [
        { name: "Authentic Regional Thali", type: "Local Feast", desc: "Complete traditional thali highlighting local seasonal vegetables, curries, and breads." },
        { name: "Street Food Delicacies", type: "Snacks", desc: "Famous local market snacks, chaat, and freshly fried savory specialties." },
        { name: "Traditional Artisanal Sweets", type: "Dessert", desc: "Handcrafted regional milk & nut desserts prepared using traditional recipes." }
      ];
    }
  }

  const transportOptions = itinerary.trip_summary?.transport_options || location.state?.transport_options
  const budgetBreakdown = itinerary.trip_summary?.budget_breakdown

  const modeBadgeText = selectedMode === 'flight'
    ? '✈️ Flight Itinerary (Fast 2.5h Transit Plan)'
    : selectedMode === 'train'
      ? '🚆 IRCTC Train Itinerary (Scenic Rail Transit Plan)'
      : selectedMode === 'road'
        ? '🚗 Road Bus Itinerary (Express Highway Plan)'
        : '🔀 Mix & Match Hybrid Plan (Outbound Flight + Return Train)';

  return (
    <div className="container-page py-12 space-y-16 bg-cream-50">
      {itinerary.trip_summary && <TripSummary summary={itinerary.trip_summary} />}

      {transportOptions && (
        <section>
          <SectionHeading eyebrow="Getting there" title="Recommended Transport Options" />
          <TransportCard 
            options={transportOptions} 
            selectedMode={selectedMode} 
            onSelectMode={setSelectedMode} 
          />
        </section>
      )}

      {budgetBreakdown && (
        <section>
          <SectionHeading eyebrow="Financial breakdown" title="Estimated Budget Allocation" />
          <BudgetBreakdown breakdown={budgetBreakdown} />
        </section>
      )}

      {daysList.length > 0 && (
        <section className="space-y-6">
          <SectionHeading 
            eyebrow="Day-by-day plan" 
            title="Your Custom Schedule" 
            badgeText={modeBadgeText}
          />
          <div className="space-y-6">
            {daysList.map((day, i) => (
              <DayCard key={i} day={day} index={i} totalDays={daysList.length} />
            ))}
          </div>
        </section>
      )}

      {allRestaurants.length > 0 && (
        <section>
          <SectionHeading eyebrow="Where to eat" title="Recommended Restaurants" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allRestaurants.map((restaurant, i) => (
              <RestaurantCard key={i} restaurant={restaurant} />
            ))}
          </div>
        </section>
      )}

      {Array.isArray(localCuisines) && localCuisines.length > 0 && (
        <section>
          <SectionHeading eyebrow="Local Culinary Delights" title="Must-Try Local Cuisines" />
          <CuisineSection 
            cuisines={localCuisines}
            destination={dest}
          />
        </section>
      )}

      {(lastHotel || itinerary.trip_summary?.hotel_options) && (
        <section>
          <SectionHeading eyebrow="Where to stay" title="Hotel Recommendations by Budget Tier" />
          <HotelCard 
            hotel={lastHotel} 
            hotelOptions={itinerary.trip_summary?.hotel_options || lastHotel?.hotel_options} 
            destination={dest}
            startDate={itinerary.trip_summary?.start_date || itinerary.start_date}
            endDate={itinerary.trip_summary?.end_date || itinerary.end_date}
          />
        </section>
      )}

      {tipsList.length > 0 && (
        <section>
          <SectionHeading eyebrow="Good to know" title="Travel Tips" />
          <TravelTips tips={tipsList} />
        </section>
      )}

      {Array.isArray(itinerary.gallery) && itinerary.gallery.length > 0 && (
        <section>
          <SectionHeading eyebrow="Sneak peek" title="Gallery" />
          <Gallery images={itinerary.gallery} />
        </section>
      )}
    </div>
  )
}
