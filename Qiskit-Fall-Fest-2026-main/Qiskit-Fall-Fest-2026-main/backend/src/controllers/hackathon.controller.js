const hackathonService = require('../services/hackathon.service')

const getHackathonInfo = async (req, res, next) => {
  try {
    const result = await hackathonService.getHackathonInfo()
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getHackathonInfo,
}
