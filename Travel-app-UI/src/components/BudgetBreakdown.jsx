export default function BudgetBreakdown({ breakdown, totalBudget }) {
  if (!breakdown && !totalBudget) return null;

  const transportCost = breakdown?.transport_cost || "30%";
  const stayCost = breakdown?.stay_cost || "35%";
  const foodCost = breakdown?.food_cost || "20%";
  const activitiesCost = breakdown?.activities_cost || "15%";
  const totalEst = breakdown?.total_estimated || totalBudget || "Estimated";
  const note = breakdown?.recommended_plan_note || "Recommended transport & stay options selected for optimal comfort and value.";

  return (
    <div className="bg-white rounded-2xl shadow-card border border-sand-200 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-clay-dark">Comprehensive Financial Plan</span>
          <h3 className="font-display font-semibold text-2xl text-ink mt-1">Itemized Budget Breakdown</h3>
        </div>
        <div className="bg-forest text-cream-50 font-display font-semibold text-base px-4 py-2 rounded-xl shadow-sm self-start sm:self-auto">
          Total Est: {totalEst}
        </div>
      </div>

      {/* ITEMIZES GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* TRANSPORT */}
        <div className="bg-cream-50/70 p-4 rounded-xl border border-sand-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">✈️</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded">Transport</span>
            </div>
            <p className="font-display font-semibold text-lg text-ink">{transportCost}</p>
          </div>
          <p className="text-xs text-ink-500 mt-2">Flight / Train / Bus tickets</p>
        </div>

        {/* STAY */}
        <div className="bg-cream-50/70 p-4 rounded-xl border border-sand-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🏨</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Stay</span>
            </div>
            <p className="font-display font-semibold text-lg text-ink">{stayCost}</p>
          </div>
          <p className="text-xs text-ink-500 mt-2">Hotel / Resort nights</p>
        </div>

        {/* FOOD */}
        <div className="bg-cream-50/70 p-4 rounded-xl border border-sand-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🍽️</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Food</span>
            </div>
            <p className="font-display font-semibold text-lg text-ink">{foodCost}</p>
          </div>
          <p className="text-xs text-ink-500 mt-2">Dining & regional cafes</p>
        </div>

        {/* SIGHTSEEING */}
        <div className="bg-cream-50/70 p-4 rounded-xl border border-sand-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🎟️</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded">Activities</span>
            </div>
            <p className="font-display font-semibold text-lg text-ink">{activitiesCost}</p>
          </div>
          <p className="text-xs text-ink-500 mt-2">Entry tickets & local tours</p>
        </div>
      </div>

      {/* RECOMMENDED PLAN ADVICE */}
      <div className="bg-forest/5 border border-forest/20 rounded-xl p-4 sm:p-5 flex items-start gap-3">
        <span className="text-2xl mt-0.5">⭐</span>
        <div>
          <h4 className="font-display font-semibold text-forest text-base">Recommended Travel Plan Strategy</h4>
          <p className="text-sm text-ink-600 mt-1 leading-relaxed">{note}</p>
        </div>
      </div>
    </div>
  );
}
