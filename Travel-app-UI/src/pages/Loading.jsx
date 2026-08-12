import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'

export default function LoadingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("Loading page started! Sending request to backend..."); 
    
    const fetchItinerary = async () => {
      // 1. Get the prompt + date range passed from the Home page
      const { prompt, startDate, endDate } = location.state || {};

      // If someone lands here without a prompt or dates, send them back home
      if (!prompt || !startDate || !endDate) {
        navigate('/');
        return;
      }

      try {
        // 2. Make the POST request to your FastAPI server.
        // The backend now derives trip duration itself from start_date/
        // end_date, so no number_of_days field is sent from the frontend.
        const res = await fetch('http://localhost:8000/api/plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // FastAPI expects {"user_message": "...", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"}
          body: JSON.stringify({
            user_message: prompt,
            start_date: startDate,
            end_date: endDate,
          }),
        });

        if (!res.ok) {
          let detail = `Server error: ${res.status}`;
          try {
            const errBody = await res.json();
            if (errBody?.detail) detail = errBody.detail;
          } catch {
            // response wasn't JSON — fall back to the generic message
          }
          throw new Error(detail);
        }

        // 3. Parse the backend response
        const data = await res.json();
        console.log("Received data from backend:", data);
        
        // 4. Navigate to the Itinerary page and pass the LIVE data
        navigate('/itinerary', { state: { itinerary: data.itinerary } });

      } catch (err) {
        console.error("Failed to fetch itinerary:", err);
        setError(err.message);
      }
    };

    fetchItinerary();
  }, [navigate, location.state]);

  return (
    <div className="container-page">
      {error ? (
        <div className="text-center py-20">
          <h2 className="font-display text-2xl font-semibold text-ink mb-3">Something went off course</h2>
          <p className="text-ink-500">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-5 py-2.5 bg-forest text-cream-50 rounded-lg hover:bg-forest-dark transition-colors font-medium"
          >
            Go back and try again
          </button>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  )
}