import { useState } from 'react'

export default function PromptBox({ onGenerate }) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // NOTE: backend integration point.
    // In production this should POST `prompt` to the itinerary-generation
    // API and pass the returned JSON forward instead of the mocked sample.
    onGenerate(prompt)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 w-full max-w-2xl bg-white rounded-2xl shadow-soft p-2 flex flex-col sm:flex-row gap-2"
    >
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Plan a 4-day trip to Goa under ₹20,000"
        className="flex-1 bg-transparent text-navy-900 placeholder:text-slate/60 px-4 py-3 rounded-xl focus:outline-none"
      />
      <button
        type="submit"
        className="bg-route hover:bg-route-dark text-white font-medium px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
      >
        Generate Itinerary
      </button>
    </form>
  )
}
