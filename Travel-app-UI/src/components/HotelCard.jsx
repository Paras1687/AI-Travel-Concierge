export default function HotelCard({ hotel }) {
  if (!hotel) return null

  return (
    <div className="bg-paper rounded-xl shadow-card border border-sand-200 overflow-hidden sm:flex hover:shadow-soft transition-shadow">
      {hotel.image ? (
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full sm:w-64 h-48 sm:h-auto object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full sm:w-56 h-40 sm:h-auto flex items-center justify-center bg-forest/10">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-forest">
            <path d="M3 19V6M3 12h17a2 2 0 012 2v5M3 12V8a1 1 0 011-1h6a1 1 0 011 1v4M21 19v-1" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="7" cy="9.5" r="1.2" />
          </svg>
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="font-display font-semibold text-xl text-ink">{hotel.name}</h4>
          <span className="flex items-center gap-1 text-sm text-gold font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {hotel.rating}
          </span>
        </div>
        <p className="text-clay-dark font-semibold mt-1">{hotel.price}</p>
        <p className="text-sm text-ink-500 mt-3 leading-relaxed">{hotel.description}</p>
      </div>
    </div>
  )
}
