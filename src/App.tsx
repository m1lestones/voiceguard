import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Auth } from './pages/Auth'
import { Enroll } from './pages/Enroll'
import { Call } from './pages/Call'
import { SecurityChallenge } from './pages/SecurityChallenge'
import { Fraud101 } from './pages/Fraud101'
import { Stats } from './pages/Stats'
import { useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isReady } = useAuth()
  const loc = useLocation()
  if (!isReady) return null
  if (!token) return <Navigate to="/auth" state={{ from: loc.pathname }} replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/enroll" element={<ProtectedRoute><Enroll /></ProtectedRoute>} />
        <Route path="/fraud-101" element={<Fraud101 />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/call" element={<ProtectedRoute><Call /></ProtectedRoute>} />
        <Route path="/challenge" element={<ProtectedRoute><SecurityChallenge /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
