export default function RestaurantCard({ restaurant }) {
  return (
    <div className="bg-paper rounded-xl shadow-card border border-sand-200 overflow-hidden hover:shadow-soft hover:-translate-y-0.5 transition-all">
      {restaurant.image ? (
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-32 flex items-center justify-center bg-clay/10">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-clay-dark">
            <path d="M6 2v8a2 2 0 002 2v10M6 2v6M8 2v6M6 8h2M17 2c-1.5 0-3 1.6-3 4.5S15.5 12 17 12v10M17 2v20" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-semibold text-ink">{restaurant.name}</h4>
          <span className="flex items-center gap-1 text-sm text-gold font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {restaurant.rating}
          </span>
        </div>
        <p className="text-xs text-clay-dark font-medium mt-1">{restaurant.cuisine}</p>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">{restaurant.description}</p>
      </div>
    </div>
  )
}
