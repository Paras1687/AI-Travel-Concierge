import PromptBox from './PromptBox'
import worldMap from '../assets/world-map.svg'

export default function Hero({ onGenerate }) {
  return (
    <section className="relative overflow-hidden bg-forest text-cream-50">
      {/* Real cartographic dot-map of the world, used as a quiet travel-forward
          backdrop rather than an abstract AI gradient. */}
      <div
        className="absolute inset-0 opacity-[0.35] bg-center bg-cover mix-blend-screen pointer-events-none"
        style={{ backgroundImage: `url(${worldMap})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-forest-dark/40 via-forest/70 to-forest pointer-events-none"
        aria-hidden="true"
      />

      {/* A single hand-drawn flight path — the signature motif echoed by the
          loading screen's orbit and the itinerary's day-by-day timeline. */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          d="M60,440 C 220,340 260,180 420,170 C 560,160 600,310 760,270 C 860,245 880,150 940,90"
          fill="none"
          stroke="#E3A87C"
          strokeWidth="2"
          strokeDasharray="1 9"
          strokeLinecap="round"
          opacity="0.8"
        />
        {[[60, 440], [420, 170], [940, 90]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4.5" fill="#C1673B" stroke="#F6F0E4" strokeWidth="1.5" />
        ))}
      </svg>

      <div className="container-page relative py-24 sm:py-32 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-cream-100/80 border border-cream-50/25 rounded-full px-4 py-1.5 mb-6">
          Personalized, AI-assisted planning
        </span>
        <h1 className="font-display font-semibold text-4xl sm:text-6xl leading-[1.1] max-w-3xl text-balance">
          Your next trip, planned like a local made it
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-cream-100/75 max-w-xl">
          Tell us where you're headed. We'll map out the days, the food, and
          the stays — down to the hour.
        </p>

        <PromptBox onGenerate={onGenerate} />
      </div>
    </section>
  )
}
