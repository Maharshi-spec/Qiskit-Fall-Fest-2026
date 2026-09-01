require('dotenv').config()

const databaseUrl = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'admin123'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'qff2026_dev'}`

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
  mailFrom: process.env.MAIL_FROM || 'noreply@qiskitfallfest.com',
  supabaseUrl: process.env.SUPABASE_URL || 'https://lxnsncmlpkdwtvrbktpb.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_jblNqUk7CFsLaRFNoUtdPw_eDMXNbc4',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
}

