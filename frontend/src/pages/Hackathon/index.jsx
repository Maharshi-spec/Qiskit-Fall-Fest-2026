import { motion } from 'framer-motion'
import Button from '../../components/Button'
import { hackathon } from '../../data/hackathon'
import sticker03 from '../../assets/qiskit/Sticker 03.svg'
import sticker04 from '../../assets/qiskit/Sticker 04.svg'

const hackathonSteps = [
  {
    title: 'Explore the challenge',
    text: 'Look at the problem space and think through how quantum ideas could be used in a practical context.',
  },
  {
    title: 'Build with Qiskit',
    text: 'Use Qiskit concepts, experimentation, and coding workflows to turn ideas into demonstrable exploration.',
  },
  {
    title: 'Collaborate and refine',
    text: 'Work with peers, share feedback, and improve the direction of your approach through hands-on iteration.',
  },
  {
    title: 'Share your results',
    text: 'Present your progress and learning outcomes to the broader event community in a clear, accessible way.',
  },
]

const Hackathon = () => {
  return (
    <motion.section className="detail-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container detail-page__header">
        <div className="detail-page__intro">
          <p className="page-shell__eyebrow">Hackathon</p>
          <h1>Build something quantum.</h1>
          <p>{hackathon[0]?.description || 'Participants explore quantum computing through projects, experiment with Qiskit, and collaborate through practical problem solving.'}</p>
        </div>
        <div className="detail-page__visual">
          <img src={sticker04} alt="" className="detail-page__sticker" />
        </div>
      </div>

      <div className="container detail-page__grid detail-page__grid--four">
        {hackathonSteps.map((step, index) => (
          <div key={step.title} className="detail-card detail-card--feature">
            <p className="detail-card__eyebrow">0{index + 1}</p>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>

      <div className="container detail-page__panel detail-page__panel--split">
        <div className="detail-page__panel-copy">
          <p className="page-shell__eyebrow">What to expect</p>
          <h2>Practical quantum learning and collaborative building.</h2>
          <p>
            The hackathon experience is designed around experimentation, learning, and teamwork. Participants explore ideas in a flexible environment that encourages honest experimentation and guided discovery.
          </p>
        </div>

        <div className="detail-page__info-stack">
          <div className="detail-info-item">
            <span>Focus</span>
            <strong>Qiskit + quantum problem solving</strong>
          </div>
          <div className="detail-info-item">
            <span>Approach</span>
            <strong>Hands-on and collaborative</strong>
          </div>
          <div className="detail-info-item">
            <span>Status</span>
            <strong>Details coming soon</strong>
          </div>
        </div>
      </div>

      <div className="container detail-page__visual-row">
        <img src={sticker03} alt="" className="detail-page__sticker detail-page__sticker--small" />
      </div>

      <div className="container detail-page__cta-row">
        <Button to="/register" kind="primary">Register your interest</Button>
        <Button to="/workshops" kind="secondary">Browse workshops</Button>
      </div>
    </motion.section>
  )
}

export default Hackathon
