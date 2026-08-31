const certificateService = require('../services/certificate.service')

const getCertificate = async (req, res, next) => {
  try {
    const result = await certificateService.getCertificate(req.params.id)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getCertificate,
}
