export default function Footer() {
  return (
    <footer className="border-t border-navy-900/10 mt-24">
      <div className="container-page py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-display font-semibold text-navy-900">
          AI Travel Concierge
        </p>
        <p className="text-sm text-slate">
          © {new Date().getFullYear()} AI Travel Concierge. Itineraries crafted by AI, refined by you.
        </p>
      </div>
    </footer>
  )
}
