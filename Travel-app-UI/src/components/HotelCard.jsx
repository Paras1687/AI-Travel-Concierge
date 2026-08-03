export default function HotelCard({ hotel }) {
  if (!hotel) return null

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden sm:flex hover:shadow-soft transition-shadow">
      <img
        src={hotel.image}
        alt={hotel.name}
        className="w-full sm:w-64 h-48 sm:h-auto object-cover"
        loading="lazy"
      />
      <div className="p-6 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="font-display font-semibold text-xl text-navy-900">{hotel.name}</h4>
          <span className="flex items-center gap-1 text-sm text-amber font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {hotel.rating}
          </span>
        </div>
        <p className="text-route-dark font-semibold mt-1">{hotel.price}</p>
        <p className="text-sm text-slate mt-3 leading-relaxed">{hotel.description}</p>
      </div>
    </div>
  )
}
