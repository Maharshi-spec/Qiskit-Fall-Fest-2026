require('dotenv').config()

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mailFrom: process.env.MAIL_FROM || 'noreply@qiskitfallfest.com',
}
