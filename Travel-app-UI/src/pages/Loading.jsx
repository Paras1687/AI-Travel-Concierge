import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'

export default function LoadingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [error, setError] = useState(null)
  const [clarificationMsg, setClarificationMsg] = useState(null)
  const [missingField, setMissingField] = useState(null)
  const [userInput, setUserInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasFetched = useRef(false)
  const turnCount = useRef(0)
  const collectedParams = useRef({
    origin: location.state?.origin || '',
    budget: location.state?.budget || ''
  })

  const fetchItinerary = async (extraParam = '') => {
    try {
      const rawState = location.state || {}
      const basePrompt = rawState.user_message || rawState.prompt || ''
      const sDate = rawState.start_date || rawState.startDate || ''
      const eDate = rawState.end_date || rawState.endDate || ''

      if (extraParam) {
        if (!collectedParams.current.origin) {
          collectedParams.current.origin = extraParam;
        } else {
          collectedParams.current.budget = extraParam;
        }
      }

      const payload = {
        user_message: basePrompt,
        start_date: sDate,
        end_date: eDate,
        origin: collectedParams.current.origin,
        budget: collectedParams.current.budget
      }

      setClarificationMsg(null)
      setIsSubmitting(false)

      const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
      
      let res = null;
      try {
        res = await fetch(`${API_URL}/api/plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true'
          },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn("Primary API URL fetch failed, trying Vercel route fallback...", e);
      }

      // Fallback to relative /api/plan if primary server returned non-200 (e.g. 511) or failed
      if (!res || !res.ok) {
        try {
          res = await fetch(`/api/plan`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'bypass-tunnel-reminder': 'true'
            },
            body: JSON.stringify(payload)
          });
        } catch (e) {
          console.error("Fallback fetch failed:", e);
        }
      }

      if (!res || !res.ok) {
        let detail = `Server error: ${res ? res.status : 'Network failure'}`;
        try {
          const errBody = await res.json();
          if (errBody?.detail) {
            detail = typeof errBody.detail === 'string'
              ? errBody.detail
              : Array.isArray(errBody.detail)
                ? errBody.detail.map(e => e.msg || JSON.stringify(e)).join(', ')
                : JSON.stringify(errBody.detail);
          }
        } catch {}
        throw new Error(detail);
      }

      const data = await res.json();
      
      if (data.status === "requires_clarification") {
        turnCount.current += 1;
        console.log("Backend requested clarification. Turn count:", turnCount.current, "Missing:", data.missing_field);
        
        if (turnCount.current > 2) {
          console.log("Max 2 clarification turns reached. Forcing fallback parameters.");
          if (!collectedParams.current.origin) collectedParams.current.origin = "Delhi";
          if (!collectedParams.current.budget) collectedParams.current.budget = "30,000";
          fetchItinerary();
          return;
        }

        setClarificationMsg(data.message);
        setMissingField(data.missing_field || 'origin');
        return;
      }
      
      console.log("Received data from backend:", data);
      navigate('/itinerary', { state: { itinerary: data.itinerary, transport_options: data.transport_options } });

    } catch (err) {
      console.error("Failed to fetch itinerary:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const rawState = location.state || {}
    const hasPrompt = Boolean(rawState.user_message || rawState.prompt)

    if (!hasPrompt) {
      console.warn("No trip prompt found on /loading page. Redirecting to Home...");
      navigate('/', { replace: true });
      return;
    }

    if (!hasFetched.current) {
      hasFetched.current = true;
      console.log("Loading page started! Sending request to backend..."); 
      fetchItinerary();
    }
  }, [navigate, location.state]);

  const handleSubmit = (e, customVal) => {
    if (e) e.preventDefault();
    const val = customVal || userInput;
    if (!val.trim()) return;
    setIsSubmitting(true);
    fetchItinerary(val);
  };

  return (
    <div className="container-page flex items-center justify-center min-h-screen bg-cream-50">
      {error ? (
        <div className="text-center py-20">
          <h2 className="font-display text-2xl font-semibold text-ink mb-3">Something went off course</h2>
          <p className="text-ink-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-forest text-cream-50 rounded-lg hover:bg-forest-dark transition-colors font-medium text-sm"
          >
            Go back and try again
          </button>
        </div>
      ) : clarificationMsg ? (
        <div className="max-w-md w-full bg-paper rounded-2xl shadow-card p-6 sm:p-8 border border-sand-200 text-center animate-fade-in space-y-5">
          <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center mx-auto text-2xl">
            {missingField === 'budget' ? '💰' : '✈️'}
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink mb-1.5">Just one quick question...</h2>
            <p className="text-ink-500 text-sm leading-relaxed">{clarificationMsg}</p>
          </div>

          {missingField === 'budget' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['₹20,000', '₹35,000', '₹50,000', 'Flexible'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={(e) => handleSubmit(e, chip)}
                  className="py-2.5 px-3 bg-cream-50 hover:bg-forest hover:text-white border border-sand-200 rounded-xl font-medium transition-colors text-ink shadow-xs"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-3">
            <input
              type="text"
              autoFocus
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={missingField === 'budget' ? "e.g. ₹25,000, ₹40,000, or Flexible..." : "e.g. New Delhi, Mumbai, London..."}
              className="w-full bg-cream-50 border border-sand-200 rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
            />
            <button
              type="submit"
              disabled={isSubmitting || !userInput.trim()}
              className="w-full bg-forest hover:bg-forest/90 text-white font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-50 text-sm shadow-sm"
            >
              {isSubmitting ? 'Updating plan...' : 'Continue to Itinerary'}
            </button>
          </form>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  )
}