import { useState } from 'react'
import DateRangePicker, { toISODate } from './DateRangePicker'

export default function PromptBox({ onGenerate }) {
  const [prompt, setPrompt] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!prompt.trim()) {
      setError('Tell us a bit about your trip first.')
      return
    }
    if (!startDate || !endDate) {
      setError('Pick both a start and an end date.')
      return
    }

    setError('')

    // Backend contract: the server now derives trip duration itself from
    // start_date/end_date (ISO "YYYY-MM-DD") — no number_of_days is sent.
    onGenerate({
      prompt,
      startDate: toISODate(startDate),
      endDate: toISODate(endDate),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 w-full max-w-2xl bg-paper rounded-2xl shadow-soft p-3 sm:p-4 flex flex-col gap-3 text-left"
    >
      <div className="flex items-center gap-2 px-1">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-clay-dark shrink-0">
          <path d="M12 21s-7-6.1-7-11.2A7 7 0 0112 3a7 7 0 017 6.8C19 14.9 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12" cy="9.8" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Plan a trip to Goa under ₹20,000, love beaches and street food"
          className="w-full bg-transparent text-ink placeholder:text-ink-500/60 py-2.5 focus:outline-none"
        />
      </div>

      <div className="h-px bg-sand-200" />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={({ startDate: s, endDate: e }) => {
            setStartDate(s)
            setEndDate(e)
          }}
          className="flex-1"
        />
        <button
          type="submit"
          className="bg-clay hover:bg-clay-dark text-cream-50 font-medium px-6 py-3 rounded-xl transition-colors whitespace-nowrap sm:self-stretch"
        >
          Plan my trip
        </button>
      </div>

      {error && <p className="text-sm text-clay-dark px-1">{error}</p>}
    </form>
  )
}
