const express = require('express')
const cors = require('cors')
const healthRoutes = require('./routes/health.routes')
const registrationRoutes = require('./routes/registration.routes')
const certificateRoutes = require('./routes/certificate.routes')
const workshopRoutes = require('./routes/workshop.routes')
const hackathonRoutes = require('./routes/hackathon.routes')
const { errorMiddleware } = require('./middleware/error.middleware')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRoutes)
app.use('/api/registration', registrationRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/workshops', workshopRoutes)
app.use('/api/hackathon', hackathonRoutes)

app.use(errorMiddleware)

module.exports = app
