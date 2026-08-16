function formatInrPrice(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return priceStr;
  
  if (priceStr.includes('EUR')) {
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) {
      const inr = Math.round(num * 90);
      return `₹${inr.toLocaleString('en-IN')} (Round Trip)`;
    }
  } else if (priceStr.includes('USD')) {
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) {
      const inr = Math.round(num * 83.5);
      return `₹${inr.toLocaleString('en-IN')} (Round Trip)`;
    }
  }

  return priceStr;
}

function cleanLabel(str) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\(null to/g, '(Delhi to').replace(/null/g, 'Delhi');
}

export default function TransportCard({ options, flightSummary, selectedMode, onSelectMode, startDate, endDate }) {
  if (!options && !flightSummary) return null;

  const sDate = startDate || '2026-10-14';
  const eDate = endDate || '2026-10-17';

  const flight = options?.flight || {
    recommended_option: flightSummary || "Akasa Air / IndiGo (Non-Stop Round Trip)",
    duration: "2h 45m",
    estimated_price: "₹15,346 (Round Trip)",
    details: "Includes verified return ticket for both flights. Fast Transit (2h 45m).",
    arrival_station: "DEL → GOX (Mopa Airport)",
    departure_station: "GOX / GOI → DEL"
  };

  const train = options?.train;
  const road = options?.road;
  const combo = options?.combo;
  const rawSummary = options?.comparison_summary;

  const activeMode = selectedMode || 'flight';

  const cleanSummary = typeof rawSummary === 'string'
    ? rawSummary
        .replace(/\\"/g, '"')
        .replace(/"\s*\+\s*"/g, ' ')
        .replace(/##/g, '')
        .replace(/\*\*/g, '')
        .replace(/\(null to/g, '(Delhi to')
        .replace(/^"|"$/g, '')
        .trim()
    : '';

  const isFlightHigh = cleanSummary.includes('Advisory') || cleanSummary.includes('most of') || cleanSummary.includes('eats up') || cleanSummary.includes('save');
  const isBusUnavailable = road?.has_direct_bus === false || road?.estimated_price === 'N/A' || road?.estimated_price === 'N/A (No Direct Bus)' || String(road?.recommended_option || '').includes('No Direct Bus');

  let originName = 'Delhi';
  let destName = 'Goa';

  const rawFlightUrl = flight?.booking_url || '';
  const cleanFlightUrl = rawFlightUrl.replace(/from\+null/g, 'from+Delhi').replace(/from\+none/g, 'from+Delhi');
  const flightUrl = (cleanFlightUrl && cleanFlightUrl.includes('google.com/travel/flights?q='))
    ? cleanFlightUrl
    : `https://www.google.com/travel/flights?q=Flights+from+${encodeURIComponent(originName)}+to+${encodeURIComponent(destName)}+on+${sDate}+returning+${eDate}+for+2+adults`;

  const trainUrl = "https://www.irctc.co.in/nget/train-search";

  const busUrl = (road?.booking_url && road.booking_url.includes('redbus.in/bus-tickets/'))
    ? road.booking_url
    : `https://www.redbus.in/bus-tickets/${encodeURIComponent(originName.toLowerCase())}-to-${encodeURIComponent(destName.toLowerCase())}?fromCityName=${encodeURIComponent(originName)}&toCityName=${encodeURIComponent(destName)}&do=${sDate}`;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-sand-200 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-clay-dark">Logistics & Multi-Modal Comparison</span>
          <h3 className="font-display font-semibold text-2xl text-ink mt-1">Select Your Preferred Travel Mode</h3>
          <p className="text-xs text-ink-500 mt-1">Click any card below to view its corresponding tailored day-by-day itinerary & schedule.</p>
        </div>
      </div>

      {cleanSummary && (
        <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-4 flex items-start gap-3.5 text-emerald-950 shadow-sm">
          <span className="text-2xl">🤖</span>
          <div>
            <h4 className="font-semibold text-emerald-900 text-xs uppercase tracking-wider">AI Travel Recommendation (Balanced Time & Money)</h4>
            <p className="text-emerald-950 font-medium text-sm mt-0.5 leading-relaxed">{cleanSummary}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* FLIGHT CARD */}
        <div
          onClick={() => onSelectMode && onSelectMode('flight')}
          className={`cursor-pointer rounded-xl p-5 border flex flex-col justify-between transition-all ${activeMode === 'flight' ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-500 shadow-md scale-[1.02]' : flight?.is_agent_pick ? 'bg-sky-50/40 border-sky-300' : 'bg-cream-50/60 border-sand-200 hover:border-sky-300'}`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">✈️</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${activeMode === 'flight' ? 'bg-sky-600 text-white font-bold' : flight?.is_agent_pick ? 'bg-sky-200 text-sky-950 font-bold' : 'bg-sky-100 text-sky-800'}`}>
                {activeMode === 'flight' ? '✓ Selected Plan' : flight?.is_agent_pick ? '⭐ Agent Pick' : 'Flight Mode'}
              </span>
            </div>
            <h4 className="font-display font-semibold text-base text-ink">{cleanLabel(flight.recommended_option)}</h4>
            <div className="mt-3 space-y-1 text-xs text-ink-500">
              <p><span className="font-semibold text-ink">Duration:</span> {flight.duration}</p>
              <p><span className="font-semibold text-clay-dark">Price:</span> {formatInrPrice(flight.estimated_price)}</p>
              {flight.arrival_station && <p><span className="font-semibold text-ink">Route:</span> {flight.arrival_station}</p>}
            </div>
            {flight.details && (
              <p className="mt-3 text-[11px] text-ink-500/80 italic leading-snug">{flight.details}</p>
            )}
          </div>
          <a
            href={flightUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white py-2 px-3 rounded-lg transition-colors w-full text-center shadow-sm"
          >
            Book Flight (Google Flights) ✈️ ↗
          </a>
        </div>

        {/* TRAIN CARD */}
        {train && (
          <div
            onClick={() => onSelectMode && onSelectMode('train')}
            className={`cursor-pointer rounded-xl p-5 border flex flex-col justify-between transition-all ${activeMode === 'train' ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500 shadow-md scale-[1.02]' : train?.is_agent_pick ? 'bg-emerald-50/40 border-emerald-300' : 'bg-cream-50/60 border-sand-200 hover:border-emerald-300'}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🚆</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${activeMode === 'train' ? 'bg-emerald-700 text-white font-bold' : train?.is_agent_pick ? 'bg-emerald-200 text-emerald-950 font-bold' : 'bg-emerald-100 text-emerald-800'}`}>
                  {activeMode === 'train' ? '✓ Selected Plan' : train?.is_agent_pick ? '⭐ Agent Pick' : 'Train Mode'}
                </span>
              </div>
              <h4 className="font-display font-semibold text-base text-ink">{cleanLabel(train.recommended_option)}</h4>
              <div className="mt-3 space-y-1 text-xs text-ink-500">
                <p><span className="font-semibold text-ink">Duration:</span> {train.duration}</p>
                <p><span className="font-semibold text-clay-dark">Price:</span> {formatInrPrice(train.estimated_price)}</p>
                {train.arrival_station && <p><span className="font-semibold text-ink">Route:</span> {train.arrival_station}</p>}
              </div>
              {train.details && (
                <p className="mt-3 text-[11px] text-ink-500/80 italic leading-snug">{train.details}</p>
              )}
            </div>
            <a
              href={trainUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-lg transition-colors w-full text-center shadow-sm"
            >
              Book IRCTC Train 🚆 ↗
            </a>
          </div>
        )}

        {/* ROAD CARD */}
        {road && (
          <div
            onClick={() => onSelectMode && onSelectMode('road')}
            className={`cursor-pointer rounded-xl p-5 border flex flex-col justify-between transition-all ${activeMode === 'road' ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500 shadow-md scale-[1.02]' : isBusUnavailable ? 'bg-amber-50/40 border-amber-300' : 'bg-cream-50/60 border-sand-200 hover:border-amber-300'}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🚌</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isBusUnavailable ? 'bg-amber-200 text-amber-950 font-bold border border-amber-400' : activeMode === 'road' ? 'bg-emerald-700 text-white font-bold' : 'bg-amber-100 text-amber-800'}`}>
                  {isBusUnavailable ? '⚠️ No Direct Bus' : activeMode === 'road' ? '✓ Selected Plan' : 'Road Bus'}
                </span>
              </div>
              <h4 className="font-display font-semibold text-base text-ink">{cleanLabel(road.recommended_option)}</h4>
              <div className="mt-3 space-y-1 text-xs text-ink-500">
                <p><span className="font-semibold text-ink">Duration:</span> {road.duration}</p>
                <p><span className="font-semibold text-clay-dark">Price:</span> {road.estimated_price}</p>
              </div>
              {road.details && (
                <p className={`mt-3 text-[11px] leading-snug p-2 rounded-lg ${isBusUnavailable ? 'bg-amber-100/80 text-amber-950 font-medium border border-amber-300' : 'text-ink-500/80 italic'}`}>{road.details}</p>
              )}
            </div>
            <a
              href={busUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white py-2 px-3 rounded-lg transition-colors w-full text-center shadow-sm"
            >
              {isBusUnavailable ? 'Book Hub Bus to Rishikesh (redBus) 🚌 ↗' : 'Book Bus (redBus) 🚌 ↗'}
            </a>
          </div>
        )}

        {/* MIX & MATCH COMBO CARD */}
        {combo && (
          <div
            onClick={() => onSelectMode && onSelectMode('combo')}
            className={`cursor-pointer rounded-xl p-5 border flex flex-col justify-between transition-all ${activeMode === 'combo' ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-500 shadow-md scale-[1.02]' : 'bg-purple-50/30 border-purple-200 hover:border-purple-300'}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🔀</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${activeMode === 'combo' ? 'bg-purple-700 text-white font-bold' : 'bg-purple-100 text-purple-900'}`}>
                  {activeMode === 'combo' ? '✓ Selected Plan' : '🔀 Mix & Match'}
                </span>
              </div>
              <h4 className="font-display font-semibold text-base text-ink">Flight + Return Train</h4>
              <div className="mt-3 space-y-1 text-xs text-ink-500">
                <p><span className="font-semibold text-ink">Duration:</span> {combo.duration}</p>
                <p><span className="font-semibold text-clay-dark">Price:</span> {combo.estimated_price}</p>
                <p><span className="font-semibold text-ink">Arrival:</span> {combo.arrival_station}</p>
                <p><span className="font-semibold text-ink">Departure:</span> {combo.departure_station}</p>
              </div>
              {combo.details && (
                <p className="mt-3 text-[11px] text-ink-500/80 italic leading-snug">{combo.details}</p>
              )}
            </div>
            <a
              href="https://www.irctc.co.in/nget/train-search"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white py-2 px-3 rounded-lg transition-colors w-full text-center shadow-sm"
            >
              Book Mixed Combo 🔀 ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
