import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Registration from './pages/Registration'
import Hackathon from './pages/Hackathon'
import Workshops from './pages/Workshops'
import Day1 from './pages/Day1'
import Day2 from './pages/Day2'
import Day3 from './pages/Day3'
import Certificates from './pages/Certificates'
import { initializeGsap } from './utils/animation'

function App() {
  const location = useLocation()

  useEffect(() => {
    initializeGsap()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    ScrollTrigger.refresh()
  }, [location.pathname])

  return (
    <Routes>
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/register" element={<MainLayout><Registration /></MainLayout>} />
      <Route path="/hackathon" element={<MainLayout><Hackathon /></MainLayout>} />
      <Route path="/workshops" element={<MainLayout><Workshops /></MainLayout>} />
      <Route path="/day-1" element={<MainLayout><Day1 /></MainLayout>} />
      <Route path="/day-2" element={<MainLayout><Day2 /></MainLayout>} />
      <Route path="/day-3" element={<MainLayout><Day3 /></MainLayout>} />
      <Route path="/certificates" element={<MainLayout><Certificates /></MainLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
