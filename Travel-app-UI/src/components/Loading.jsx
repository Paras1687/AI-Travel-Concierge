export default function Loading({ message = 'Planning your perfect journey...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-mist" />
        <div className="absolute inset-0 rounded-full border-4 border-route border-t-transparent animate-spin" />
      </div>
      <p className="font-display text-lg text-navy-900">{message}</p>
      <p className="text-sm text-slate max-w-xs text-center">
        Mapping attractions, matching restaurants, and checking the weather along your route.
      </p>
    </div>
  )
}
