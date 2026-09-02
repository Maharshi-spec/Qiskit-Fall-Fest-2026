const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const normalizeMailValue = (value, fallback = '') => String(value ?? fallback).trim()
const normalizeMailPassword = (value) => normalizeMailValue(value, '').replace(/\s+/g, '')

const databaseUrl = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'admin123'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'qff2026_dev'}`

const mailConfig = {
  host: normalizeMailValue(process.env.MAIL_HOST),
  port: normalizeMailValue(process.env.MAIL_PORT),
  user: normalizeMailValue(process.env.MAIL_USER),
  password: normalizeMailPassword(process.env.MAIL_PASSWORD),
  from: normalizeMailValue(process.env.MAIL_FROM),
  fromName: normalizeMailValue(process.env.MAIL_FROM_NAME, 'Qiskit Fall Fest 2026'),
}

const getMailConfigStatus = () => ({
  MAIL_HOST: Boolean(mailConfig.host),
  MAIL_PORT: Boolean(mailConfig.port),
  MAIL_USER: Boolean(mailConfig.user),
  MAIL_PASSWORD: Boolean(mailConfig.password),
  MAIL_FROM: Boolean(mailConfig.from),
  MAIL_FROM_NAME: Boolean(mailConfig.fromName),
})

module.exports = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || 'qff2026_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin123',
  },
  databaseUrl,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mail: mailConfig,
  getMailConfigStatus,
  mailFrom: mailConfig.from,
  mailFromName: mailConfig.fromName || 'Qiskit Fall Fest 2026',
  supabaseUrl: process.env.SUPABASE_URL || 'https://lxnsncmlpkdwtvrbktpb.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_jblNqUk7CFsLaRFNoUtdPw_eDMXNbc4',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
}

