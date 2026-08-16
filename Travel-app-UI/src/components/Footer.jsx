import { LOGO_DATA_URI } from '../assets/logo_b64'

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-24 bg-cream-100">
      <div className="container-page py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={LOGO_DATA_URI} alt="TripWeave Logo" className="w-6 h-6 object-contain rounded" />
          <p className="font-display font-semibold text-ink text-lg">
            TripWeave
          </p>
        </div>
        <p className="text-sm text-ink-500">
          © {new Date().getFullYear()} TripWeave. Plan the trip, live the trip.
        </p>
      </div>
    </footer>
  )
}
