import { motion } from 'framer-motion'

const OrganizerCard = ({ name, role, organization, description, image, alt }) => {
  const hasImage = Boolean(image)

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`organizer-card ${hasImage ? '' : 'organizer-card--placeholder'}`}
    >
      <div className="organizer-card__media" aria-label={alt || 'Organizer announcement coming soon'}>
        {hasImage ? (
          <img src={image} alt={alt || name || 'Organizer'} className="organizer-card__image" />
        ) : (
          <div className="organizer-card__mark">
            <span>{name ? name.charAt(0).toUpperCase() : 'Q'}</span>
          </div>
        )}
      </div>

      <div>
        <h3>{name || 'Organizer details coming soon'}</h3>
        {role && <p className="organizer-card__role">{role}</p>}
        {organization && <p className="organizer-card__organization">{organization}</p>}
        {description && <p>{description}</p>}
      </div>
    </motion.article>
  )
}

export default OrganizerCard
