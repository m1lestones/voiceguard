import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Enroll } from './pages/Enroll'
import { Call } from './pages/Call'
import { SecurityChallenge } from './pages/SecurityChallenge'
import { Fraud101 } from './pages/Fraud101'
import { Stats } from './pages/Stats'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/fraud-101" element={<Fraud101 />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/call" element={<Call />} />
        <Route path="/challenge" element={<SecurityChallenge />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
