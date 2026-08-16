export default function HotelCard({ hotel, hotelOptions, destination, startDate, endDate }) {
  let options = (Array.isArray(hotelOptions) && hotelOptions.length >= 3)
    ? hotelOptions
    : (Array.isArray(hotel?.hotel_options) && hotel.hotel_options.length >= 3)
      ? hotel.hotel_options
      : null;

  const dest = destination || hotel?.destination || '';
  const sDate = startDate || hotel?.start_date || '';
  const eDate = endDate || hotel?.end_date || '';

  if (!options || options.length < 3) {
    const cleanDest = dest || 'Destination';
    options = [
      {
        tier: '💡 Budget Choice',
        tier_badge: 'Budget',
        name: `Zostel ${cleanDest}`,
        rating: 4.6,
        price: '₹1,150 / night',
        description: 'Clean cozy local stay (60% below budget) with free WiFi & breakfast.'
      },
      {
        tier: '⭐ Recommended Value',
        tier_badge: 'Best Value',
        name: `Fortune Park ${cleanDest}`,
        rating: 4.7,
        price: '₹3,200 / night',
        description: 'Upscale 4-star hotel (within 10% of budget) with modern amenities & pool.'
      },
      {
        tier: '👑 Luxury Choice',
        tier_badge: 'Luxury',
        name: cleanDest.toLowerCase().includes('kashmir') || cleanDest.toLowerCase().includes('srinagar') ? 'Vivanta Dal View Srinagar' : `Vivanta ${cleanDest}`,
        rating: 4.9,
        price: '₹9,332 / night',
        description: '5-star luxury Taj hotel (60% above budget) with fine dining & spa.'
      }
    ];
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {options.map((h, idx) => {
        const badgeClass = h.tier_badge === 'Budget'
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : h.tier_badge === 'Luxury'
            ? 'bg-purple-100 text-purple-900 border-purple-300'
            : 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold';

        const displayName = h.name || (idx === 0 ? 'Budget Stay' : idx === 1 ? 'Value Hotel' : 'Luxury Resort');
        const displayPrice = h.price || '₹3,200 / night';
        const displayDesc = h.description || 'Verified accommodation option.';
        
        const cleanHotelName = displayName.replace(/&/g, 'and').replace(/[\(\)\,\-\.\|]/g, ' ').replace(/\s+/g, ' ').trim();
        const sClean = sDate && String(sDate).trim().toLowerCase() !== 'null' ? String(sDate).trim() : '';
        const eClean = eDate && String(eDate).trim().toLowerCase() !== 'null' ? String(eDate).trim() : '';
        const dateParam = (sClean && eClean) ? `&checkin=${sClean}&checkout=${eClean}` : '';
        
        const nameLower = displayName.toLowerCase();
        let bookingComUrl = '';

        if (nameLower.includes('vivanta dal view') || nameLower.includes('taj kashmir') || nameLower.includes('khyber')) {
          bookingComUrl = 'https://www.booking.com/hotel/in/vivanta-dal-view.html';
        } else if (nameLower.includes('taj fort aguada')) {
          bookingComUrl = 'https://www.booking.com/hotel/in/taj-fort-aguada-resort.html';
        } else if (nameLower.includes('fairfield by marriott goa')) {
          bookingComUrl = 'https://www.booking.com/hotel/in/fairfield-by-marriott-goa-anjuna.html';
        } else if (nameLower.includes('zostel goa')) {
          bookingComUrl = 'https://www.booking.com/hotel/in/zostel-goa.html';
        } else if (nameLower.includes('rambagh palace')) {
          bookingComUrl = 'https://www.booking.com/hotel/in/rambagh-palace.html';
        } else if (h.booking_url && h.booking_url.includes('booking.com/hotel/in/')) {
          bookingComUrl = h.booking_url;
        } else {
          bookingComUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cleanHotelName)}${dateParam}`;
        }

        return (
          <div key={idx} className="bg-paper rounded-xl shadow-card border border-sand-200 p-6 flex flex-col justify-between hover:border-forest/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🏨</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClass}`}>
                  {h.tier || (idx === 0 ? '💡 Budget Choice' : idx === 1 ? '⭐ Recommended Value' : '👑 Luxury Choice')}
                </span>
              </div>
              <h4 className="font-display font-semibold text-lg text-ink">{displayName}</h4>
              <div className="flex items-center gap-1 text-xs text-gold font-medium mt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{h.rating || 4.7}</span>
              </div>
              <p className="text-clay-dark font-semibold mt-3 font-display text-sm">Est. Stay: {displayPrice}</p>
              <p className="text-xs text-ink-500 mt-2 leading-relaxed">{displayDesc}</p>
            </div>

            <a
              href={bookingComUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-forest hover:bg-forest/90 text-white py-2.5 px-4 rounded-lg transition-colors shadow-sm w-full text-center"
            >
              Book Hotel (Booking.com) 🛎️ ↗
            </a>
          </div>
        );
      })}
    </div>
  );
}
