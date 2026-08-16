import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import LoadingPage from './pages/Loading'
import Itinerary from './pages/Itinerary'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/itinerary" element={<Itinerary />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
