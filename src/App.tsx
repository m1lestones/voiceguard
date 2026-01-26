import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Enroll } from './pages/Enroll'
import { Call } from './pages/Call'
import { SecurityChallenge } from './pages/SecurityChallenge'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/call" element={<Call />} />
        <Route path="/challenge" element={<SecurityChallenge />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
