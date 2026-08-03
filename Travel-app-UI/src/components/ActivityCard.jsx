export default function ActivityCard({ activity }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-soft hover:-translate-y-0.5 transition-all">
      <img
        src={activity.image}
        alt={activity.name}
        className="w-full sm:w-40 h-40 sm:h-auto object-cover"
        loading="lazy"
      />
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h4 className="font-display font-semibold text-navy-900">{activity.name}</h4>
          <span className="text-xs font-medium text-route-dark bg-route/10 rounded-full px-3 py-1">
            {activity.time}
          </span>
        </div>
        <p className="text-sm text-slate mt-2 leading-relaxed">{activity.description}</p>
        <p className="text-xs text-slate/70 mt-3">Est. duration: {activity.duration}</p>
      </div>
    </div>
  )
}
