# AI Travel Concierge — Frontend

A clean, responsive React + Tailwind frontend for an AI-generated travel itinerary product. Currently wired to mocked JSON (`src/data/sampleItinerary.json`) so it runs standalone; every place where a real backend call belongs is marked with a `BACKEND INTEGRATION POINT` comment.

## Stack

- React 18 + Vite
- Tailwind CSS
- React Router (Home → Loading → Itinerary flow)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Project structure

```
src/
  components/   # Navbar, Hero, PromptBox, Loading, TripSummary, DayCard,
                # ActivityCard, RestaurantCard, HotelCard, WeatherCard,
                # TravelTips, Gallery, Footer
  pages/        # Home, Loading, Itinerary
  data/         # sampleItinerary.json (mocked backend response)
```

## Connecting the real backend

1. On the Home page, `PromptBox` calls `onGenerate(prompt)`. Replace the
   `navigate('/loading', ...)` call in `pages/Home.jsx` with a `fetch` (or
   keep the navigate, but pass the prompt through).
2. In `pages/Loading.jsx`, replace the `setTimeout` with the actual API
   call, and navigate to `/itinerary` with the response in router state:
   `navigate('/itinerary', { state: { itinerary: data } })`.
3. `pages/Itinerary.jsx` already prefers `location.state.itinerary` over
   the local sample JSON, so no further changes are needed there.

The expected JSON shape is documented in `src/data/sampleItinerary.json`.

## Design notes

Palette: deep navy (`#0B2545`), teal "route" accent (`#2EC4B6`), soft mist
background (`#EAF3F6`), slate text, with amber reserved only for star
ratings. Typography pairs Space Grotesk (display) with Inter (body). The
recurring visual motif is a dotted "route line" — drawn once in the Hero
and reused as the vertical timeline connecting Morning → Afternoon →
Evening → Night inside each `DayCard`.
