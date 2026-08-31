const { db, databaseUrl } = require('./env')
const { Pool } = require('pg')

const poolConfig = {
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}

const pool = new Pool(poolConfig)

pool.on('error', (err) => {
  console.error('Unexpected Postgres client error', err)
})

module.exports = {
  host: db.host,
  port: db.port,
  name: db.name,
  user: db.user,
  password: db.password,
  databaseUrl,
  pool,
}
