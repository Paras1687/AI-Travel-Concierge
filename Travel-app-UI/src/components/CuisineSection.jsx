export default function CuisineSection({ cuisines, destination }) {
  if (!Array.isArray(cuisines) || cuisines.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cuisines.map((item, idx) => (
        <div key={idx} className="bg-paper rounded-xl shadow-card border border-sand-200 p-6 flex flex-col justify-between hover:border-forest/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🍲</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-clay-dark bg-clay/10 rounded-full px-2.5 py-1">
                {item.type}
              </span>
            </div>
            <h4 className="font-display font-semibold text-lg text-ink">{item.name}</h4>
            <p className="text-xs text-ink-500 mt-2 leading-relaxed">{item.desc}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-sand-200 flex items-center justify-between text-xs text-forest font-medium">
            <span>Must-Try in {destination || 'Location'}</span>
            <span>✨ Local Delicacy</span>
          </div>
        </div>
      ))}
    </div>
  );
}
