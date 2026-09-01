import { motion } from 'framer-motion'
import Button from '../../components/Button'
import sticker02 from '../../assets/qiskit/Sticker 02.svg'
import sticker07 from '../../assets/qiskit/Sticker 07.svg'

const certificateHighlights = [
  'Event Participant Certificate — awarded to participants who attend and take part in Qiskit Fall Fest 2026.',
  'Hackathon Participant Certificate — awarded to participants who complete and participate in the Qiskit Fall Fest 2026 hackathon.',
  'Workshop Participant Certificate — awarded to participants who attend and participate in the Qiskit Fall Fest 2026 workshops.',
]

const Certificates = () => {
  return (
    <motion.section className="detail-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container detail-page__header">
        <div className="detail-page__intro">
          <p className="page-shell__eyebrow">Certificates</p>
          <h1>Your Qiskit Fall Fest 2026 Certificate.</h1>
          <p>
            Participants can receive certificates based on their involvement in Qiskit Fall Fest 2026. Whether you attend the main event, take part in the hackathon, or join a workshop, your participation can be recognized with the corresponding certificate.
          </p>
        </div>
        <div className="detail-page__visual">
          <img src={sticker07} alt="" className="detail-page__sticker" />
        </div>
      </div>

      <div className="container detail-page__grid detail-page__grid--three">
        {certificateHighlights.map((item) => (
          <div key={item} className="detail-card">
            <p className="detail-card__eyebrow">Certificate</p>
            <p>{item}</p>
          </div>
        ))}
      </div>

      <div className="container detail-page__panel detail-page__panel--split">
        <div className="detail-page__panel-copy">
          <p className="page-shell__eyebrow">Certificate collection</p>
          <h2>Find your certificate after the event.</h2>
          <p>
            Use your registered event email to check whether your certificate is available for collection. Certificates are provided according to your participation in the event, hackathon, or workshops.
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