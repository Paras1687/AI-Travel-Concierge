export default function RestaurantCard({ restaurant }) {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-soft hover:-translate-y-0.5 transition-all">
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="w-full h-40 object-cover"
        loading="lazy"
      />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-semibold text-navy-900">{restaurant.name}</h4>
          <span className="flex items-center gap-1 text-sm text-amber font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {restaurant.rating}
          </span>
        </div>
        <p className="text-xs text-route-dark font-medium mt-1">{restaurant.cuisine}</p>
        <p className="text-sm text-slate mt-2 leading-relaxed">{restaurant.description}</p>
      </div>
    </div>
  )
}
