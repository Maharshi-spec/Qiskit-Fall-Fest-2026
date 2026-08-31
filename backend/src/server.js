import dotenv from 'dotenv'
import app from './app.js'
import { connectDB } from './config/database.js'

dotenv.config()

const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Connect to database
connectDB()

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`)
})
