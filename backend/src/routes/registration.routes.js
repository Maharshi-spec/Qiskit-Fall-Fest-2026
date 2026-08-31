const express = require('express')
const router = express.Router()

router.post('/', (req, res) => {
  res.json({ message: 'Registration endpoint ready' })
})

module.exports = router
