import { motion } from 'framer-motion'
import Button from '../../components/Button'
import sticker02 from '../../assets/qiskit/Sticker 02.svg'
import sticker07 from '../../assets/qiskit/Sticker 07.svg'

const certificateHighlights = [
  'Participation and attendance guidance will be shared as the program is finalized.',
  'The event experience is designed to support learning, experimentation, and community connection.',
  'Certificate details will be made available through the official event flow when enabled.',
]

const Certificates = () => {
  return (
    <motion.section className="detail-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container detail-page__header">
        <div className="detail-page__intro">
          <p className="page-shell__eyebrow">Certificates</p>
          <h1>Your Qiskit Fall Fest journey.</h1>
          <p>
            Qiskit Fall Fest is designed as a learning-centered experience, and certificate information will be shared through the event workflow when it becomes available.
          </p>
        </div>
        <div className="detail-page__visual">
          <img src={sticker07} alt="" className="detail-page__sticker" />
        </div>
      </div>

      <div className="container detail-page__grid detail-page__grid--three">
        {certificateHighlights.map((item) => (
          <div key={item} className="detail-card">
            <p className="detail-card__eyebrow">Certificate info</p>
            <p>{item}</p>
          </div>
        ))}
      </div>

      <div className="container detail-page__panel detail-page__panel--split">
        <div className="detail-page__panel-copy">
          <p className="page-shell__eyebrow">Certificate collection</p>
          <h2>Frontend-ready structure for the event utility flow.</h2>
          <p>
            This page keeps the experience polished and clear while intentionally avoiding unsupported claims about generation, validity, or backend certificate logic.
          </p>
        </div>

        <div className="detail-page__form-shell detail-page__form-shell--compact">
          <form className="detail-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              Event email
              <input type="email" placeholder="participant@example.com" />
            </label>
            <button type="submit" className="button button--primary">Check certificate status</button>
          </form>
        </div>
      </div>

      <div className="container detail-page__visual-row">
        <img src={sticker02} alt="" className="detail-page__sticker detail-page__sticker--small" />
      </div>

      <div className="container detail-page__cta-row">
        <Button to="/" kind="secondary">Back to home</Button>
        <Button to="/register" kind="primary">Register for the event</Button>
      </div>
    </motion.section>
  )
}

export default Certificates
