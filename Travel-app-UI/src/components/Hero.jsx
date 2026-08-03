import PromptBox from './PromptBox'

export default function Hero({ onGenerate }) {
  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white">
      {/* Signature element: a hand-drawn flight route connecting three pins,
          echoed later by the vertical journey line on the Itinerary page. */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          d="M60,480 C 220,380 260,220 420,200 C 560,185 600,340 760,300 C 860,275 880,180 940,120"
          fill="none"
          stroke="#7FE0D6"
          strokeWidth="2.5"
          strokeDasharray="6 10"
          strokeLinecap="round"
          className="animate-route-draw"
          style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
        />
        {[
          [60, 480],
          [420, 200],
          [760, 300],
          [940, 120],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="6" fill="#2EC4B6" className="animate-float-slow" />
        ))}
      </svg>

      <div className="container-page relative py-24 sm:py-32 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-route-light/90 bg-white/10 rounded-full px-4 py-1.5 mb-6">
          Powered by AI itinerary planning
        </span>
        <h1 className="font-display font-semibold text-4xl sm:text-6xl leading-tight max-w-3xl">
          AI Travel Concierge
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-white/80 max-w-xl">
          Plan your perfect trip with AI-powered personalised itineraries.
        </p>

        <PromptBox onGenerate={onGenerate} />
      </div>
    </section>
  )
}
