import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/login/login'
import SignupPage from './pages/signup/signup'
import Dashboard from './pages/dashboard/dashboard'
import LandingPage from './components/landingpage'
import Analysis from './pages/analysis/analysispage'
import InteractiveMap from './pages/interactivemap/interactivemap'
import MapAnalysis from './pages/mapanalysis/mapanalysis'
import BlogPage from './pages/blog/blog'
import FeaturesPage from './components/features'

function App() {
  const isAuthed = () => !!localStorage.getItem("access_token")

  return (
    <Routes>
      {/* Default redirect based on auth */}
      <Route path="/" element={<Navigate to={isAuthed() ? "/landingpage" : "/login"} replace />} />
      
      {/* Authentication routes */}
      <Route path="/login" element={isAuthed() ? <Navigate to="/landingpage" replace /> : <LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Protected/Main application routes */}
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/landingpage" element={<LandingPage />} />
      <Route path="/analysispage" element={<Analysis/>} />
      <Route path="/interactivemap" element={<InteractiveMap />} />
      <Route path="/mapanalysis" element={<MapAnalysis />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/features" element={<FeaturesPage />} />

      {/* Catch-all route - redirects any unknown paths to login or landing */}
      <Route path="*" element={<Navigate to={isAuthed() ? "/landingpage" : "/login"} replace />} />
    </Routes>
  )
}

export default App