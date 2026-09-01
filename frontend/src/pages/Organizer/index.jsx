import { motion } from 'framer-motion'
import Button from '../../components/Button'

const Organizer = () => {
  return (
    <motion.section
      className="detail-page"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="container detail-page__header">
        <div className="detail-page__intro">
          <p className="page-shell__eyebrow">Portal</p>
          <h1>Organizer Portal</h1>
          <p>
            Welcome to the Qiskit Fall Fest 2026 Organizer Portal. Management and event administration tools will be available here soon.
          </p>
        </div>
      </div>

      <div className="container detail-page__panel" style={{ marginTop: '2rem' }}>
        <div className="detail-page__panel-copy">
          <p className="page-shell__eyebrow" style={{ color: '#ff4fa3' }}>Coming Soon</p>
          <h2 style={{ color: '#3d2f59' }}>Organizer Dashboard Under Construction</h2>
          <p>
            The organizer management interface is currently being prepared. Check back closer to event launch for admin access and participant tools.
          </p>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Button to="/" kind="primary">Back to Home</Button>
        </div>
      </div>
    </motion.section>
  )
}

export default Organizer
