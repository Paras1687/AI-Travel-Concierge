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
      // 1. Get the prompt passed from the Home page
      const prompt = location.state?.prompt;
      
      // If someone lands here without a prompt, send them back home
      if (!prompt) {
        navigate('/');
        return;
      }

      try {
        // 2. Make the POST request to your FastAPI server
        const res = await fetch('http://localhost:8000/api/plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // FastAPI expects {"user_message": "..."}
          body: JSON.stringify({ user_message: prompt }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
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
        <div className="text-center py-20 text-red-600">
          <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-6 px-4 py-2 bg-navy-900 text-white rounded hover:bg-slate-800"
          >
            Go Back and Try Again
          </button>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  )
}