import { useEffect, useRef, useState } from 'react'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function startOfDay(d) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isBefore(a, b) {
  return startOfDay(a).getTime() < startOfDay(b).getTime()
}

function isWithinRange(day, start, end) {
  if (!start || !end) return false
  const t = startOfDay(day).getTime()
  return t > startOfDay(start).getTime() && t < startOfDay(end).getTime()
}

function formatLong(date) {
  if (!date) return null
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function toISODate(date) {
  if (!date) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildMonthGrid(viewMonth) {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-clay-dark shrink-0">
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3.5 9.5h17M8 3v3.4M16 3v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

/**
 * A single-calendar date-range picker styled to match the "Wayfarer" theme.
 * Click a date to set the start, click another to set the end (range
 * highlighted in between). Dates before `minDate` are disabled.
 */
export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate = startOfDay(new Date()),
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(
    () => new Date((startDate || new Date()).getFullYear(), (startDate || new Date()).getMonth(), 1)
  )
  const [hoverDate, setHoverDate] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleDayClick = (day) => {
    if (isBefore(day, minDate)) return

    // No start yet, or both already set -> begin a fresh range.
    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: day, endDate: null })
      return
    }

    // Have a start, picking the end.
    if (isBefore(day, startDate)) {
      onChange({ startDate: day, endDate: null })
    } else if (isSameDay(day, startDate)) {
      onChange({ startDate: day, endDate: day })
      setOpen(false)
    } else {
      onChange({ startDate, endDate: day })
      setOpen(false)
    }
  }

  const changeMonth = (delta) => {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))
  }

  const canGoPrev = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1) > new Date(minDate.getFullYear(), minDate.getMonth(), 1)

  const cells = buildMonthGrid(viewMonth)
  const previewEnd = !endDate && startDate ? hoverDate : endDate

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-col items-start gap-1 bg-cream-50 border border-sand-200 rounded-xl px-3.5 py-2.5 text-left hover:border-clay/60 transition-colors focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-1 focus:ring-offset-cream-50"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Start date</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <CalendarIcon />
            {formatLong(startDate) || 'Select date'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-col items-start gap-1 bg-cream-50 border border-sand-200 rounded-xl px-3.5 py-2.5 text-left hover:border-clay/60 transition-colors focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-1 focus:ring-offset-cream-50"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">End date</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <CalendarIcon />
            {formatLong(endDate) || 'Select date'}
          </span>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[min(92vw,320px)] bg-paper rounded-2xl shadow-soft border border-sand-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              disabled={!canGoPrev}
              className="w-8 h-8 flex items-center justify-center rounded-full text-ink-700 hover:bg-sand/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Previous month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <p className="font-display font-semibold text-ink text-sm">
              {viewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </p>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-ink-700 hover:bg-sand/60 transition-colors"
              aria-label="Next month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAY_LABELS.map((w, i) => (
              <div key={i} className="text-center text-[11px] font-semibold text-ink-500/70 h-7 flex items-center justify-center">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />

              const disabled = isBefore(day, minDate)
              const isStart = isSameDay(day, startDate)
              const isEnd = isSameDay(day, endDate)
              const inRange = isWithinRange(day, startDate, previewEnd) || isWithinRange(day, previewEnd, startDate)
              const isEdge = isStart || isEnd

              return (
                <div key={i} className="relative flex items-center justify-center h-9">
                  {inRange && <div className="absolute inset-y-0 left-0 right-0 bg-clay/12" />}
                  {isStart && (startDate && (endDate || hoverDate)) && (
                    <div className="absolute inset-y-0 left-1/2 right-0 bg-clay/12" />
                  )}
                  {isEnd && (
                    <div className="absolute inset-y-0 right-1/2 left-0 bg-clay/12" />
                  )}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={() => setHoverDate(day)}
                    className={`relative w-9 h-9 rounded-full text-sm font-medium transition-colors flex items-center justify-center
                      ${disabled ? 'text-ink-500/30 cursor-not-allowed' : 'text-ink hover:bg-clay/20 cursor-pointer'}
                      ${isEdge ? 'bg-clay text-cream-50 hover:bg-clay-dark shadow-sm' : ''}
                    `}
                  >
                    {day.getDate()}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-sand-200">
            <p className="text-xs text-ink-500">
              {startDate && !endDate ? 'Now pick your end date' : 'Tap a date to start'}
            </p>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => onChange({ startDate: null, endDate: null })}
                className="text-xs font-medium text-clay-dark hover:text-clay-dark/80"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { toISODate, formatLong }
