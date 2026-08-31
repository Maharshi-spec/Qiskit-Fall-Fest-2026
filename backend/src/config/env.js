import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/qiskit-fall-fest',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
}

export default config
