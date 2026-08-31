const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: 'Certificate endpoint ready' })
})

module.exports = router
