import { useEffect, useState } from 'react'

// Mirrors the actual backend pipeline order (extractor -> weather ->
// researcher -> planner -> image_fetcher) so the rotating copy reads like
// real progress rather than generic filler.
const MESSAGES = [
  'Reading your travel preferences...',
  'Checking the weather ahead...',
  'Scouting places worth your time...',
  'Building your day-by-day route...',
  'Adding the finishing touches...',
]

export default function Loading() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-28 sm:py-36">
      <div className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px]">
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full animate-globe-bob"
          aria-hidden="true"
        >
          <defs>
            {/* Soft, non-neon sphere shading in the site's forest palette */}
            <radialGradient id="globeBody" cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#5C7F6B" />
              <stop offset="45%" stopColor="#37543F" />
              <stop offset="100%" stopColor="#1B2C22" />
            </radialGradient>
            <radialGradient id="globeAtmosphere" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#4F715E" stopOpacity="0" />
              <stop offset="92%" stopColor="#B7CDBB" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#B7CDBB" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="specular" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F6F0E4" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#F6F0E4" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1B2C22" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1B2C22" stopOpacity="0" />
            </radialGradient>
            <clipPath id="sphereClip">
              <circle cx="120" cy="120" r="66" />
            </clipPath>
          </defs>

          {/* Grounding shadow, breathes gently in sync with the bob */}
          <ellipse
            cx="120" cy="206" rx="58" ry="10"
            fill="url(#groundShadow)"
            className="animate-globe-shadow"
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />

          {/* Faint outer atmosphere glow */}
          <circle cx="120" cy="120" r="82" fill="url(#globeAtmosphere)" />

          {/* Flight orbit path (the route the plane traces) */}
          <ellipse
            cx="120" cy="120" rx="102" ry="40"
            fill="none"
            stroke="#C1673B"
            strokeOpacity="0.35"
            strokeWidth="1.3"
            strokeDasharray="1.5 7"
            transform="rotate(-12 120 120)"
          />

          {/* The sphere itself */}
          <circle cx="120" cy="120" r="66" fill="url(#globeBody)" />

          {/* Wireframe meridians — each ellipse's horizontal radius
              oscillates out of phase with the others, giving the classic
              illusion of longitude lines sweeping around a spinning sphere. */}
          <g clipPath="url(#sphereClip)" stroke="#F6F0E4" strokeOpacity="0.32" fill="none" strokeWidth="1">
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse key={i} cx="120" cy="120" ry="66" rx="66">
                <animate
                  attributeName="rx"
                  values="0;66;0"
                  dur="5.4s"
                  begin={`${(i * 5.4) / 5}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                  keyTimes="0;0.5;1"
                />
              </ellipse>
            ))}

            {/* Static latitude lines for a touch more sphere structure */}
            <ellipse cx="120" cy="120" rx="66" ry="18" strokeOpacity="0.22" />
            <ellipse cx="120" cy="120" rx="66" ry="40" strokeOpacity="0.22" />

            {/* Subtle drifting landmass blobs for texture, not literal geography */}
            <g fill="#E3A87C" opacity="0.28">
              <ellipse cx="98" cy="96" rx="14" ry="9">
                <animateTransform attributeName="transform" type="translate" values="-40 0;40 0;-40 0" dur="9s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="150" cy="140" rx="10" ry="7">
                <animateTransform attributeName="transform" type="translate" values="-40 0;40 0;-40 0" dur="9s" begin="-3s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="115" cy="150" rx="8" ry="6">
                <animateTransform attributeName="transform" type="translate" values="-40 0;40 0;-40 0" dur="9s" begin="-6s" repeatCount="indefinite" />
              </ellipse>
            </g>
          </g>

          {/* Glossy specular highlight for a polished, dimensional look */}
          <ellipse cx="98" cy="92" rx="26" ry="18" fill="url(#specular)" clipPath="url(#sphereClip)" />

          {/* Plane orbiting the globe along the flight path */}
          <g>
            <path id="flightPath" d="M18,120 A102,40 -12 1,1 222,120 A102,40 -12 1,1 18,120" fill="none" />
            <g>
              <path
                d="M0,-5 L2.6,0 L0.6,0.4 L0.6,4.6 L-0.6,4.6 L-0.6,0.4 L-2.6,0 Z"
                fill="#C1673B"
                stroke="#F6F0E4"
                strokeWidth="0.4"
                transform="scale(1.9)"
              />
              <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
                <mpath href="#flightPath" xlinkHref="#flightPath" />
              </animateMotion>
            </g>
          </g>
        </svg>
      </div>

      <div key={messageIndex} className="text-center animate-fade-in px-6">
        <p className="font-display text-lg text-ink">{MESSAGES[messageIndex]}</p>
      </div>
    </div>
  )
}
