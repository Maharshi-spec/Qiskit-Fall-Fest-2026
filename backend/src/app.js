import express from 'express'
import cors from 'cors'
import { errorMiddleware } from './middleware/error.middleware.js'
import { rateLimitMiddleware } from './middleware/rateLimit.middleware.js'
import healthRoutes from './routes/health.routes.js'
import registrationRoutes from './routes/registration.routes.js'
import certificateRoutes from './routes/certificate.routes.js'
import workshopRoutes from './routes/workshop.routes.js'
import hackathonRoutes from './routes/hackathon.routes.js'

const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(rateLimitMiddleware)

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/registration', registrationRoutes)
app.use('/api/certificate', certificateRoutes)
app.use('/api/workshop', workshopRoutes)
app.use('/api/hackathon', hackathonRoutes)

// Error handling middleware
app.use(errorMiddleware)

export default app
