const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const healthRoutes = require('./routes/health.routes')
const registrationRoutes = require('./routes/registration.routes')
const authRoutes = require('./routes/auth.routes')
const adminRoutes = require('./routes/admin.routes')
const certificateRoutes = require('./routes/certificate.routes')
const workshopRoutes = require('./routes/workshop.routes')
const hackathonRoutes = require('./routes/hackathon.routes')
const { errorMiddleware } = require('./middleware/error.middleware')
const { validateRequest } = require('./middleware/validation.middleware')
const { rateLimit } = require('./middleware/rateLimit.middleware')

const app = express()

app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(rateLimit)
app.use(validateRequest)

app.use('/api/v1', healthRoutes)
app.use('/api/v1', registrationRoutes)
app.use('/api/v1', authRoutes)
app.use('/api/v1', adminRoutes)
app.use('/api/v1', certificateRoutes)
app.use('/api/v1', workshopRoutes)
app.use('/api/v1', hackathonRoutes)

app.use(errorMiddleware)

module.exports = app
