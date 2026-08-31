const { db, databaseUrl } = require('./env')

module.exports = {
  host: db.host,
  port: db.port,
  name: db.name,
  user: db.user,
  password: db.password,
  databaseUrl,
}
