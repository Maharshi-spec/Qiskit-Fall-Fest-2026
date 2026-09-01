const certificateService = require('../services/certificate.service')

const generateCertificate = async (req, res, next) => {
  try {
    const payload = req.body || {}
    const result = await certificateService.generateCertificate(payload)

    if (result && result.success === false && result.error) {
      return res.status(503).json({
        success: false,
        error: result.error,
      })
    }

    return res.status(201).json({ success: true, data: result })
  } catch (error) {
    return next(error)
  }
}

const getCertificates = async (req, res, next) => {
  try {
    const result = await certificateService.listCertificates()
    return res.json({ success: true, data: result })
  } catch (error) {
    return next(error)
  }
}

const getCertificateById = async (req, res, next) => {
  try {
    const result = await certificateService.getCertificateById(req.params.certificateId)

    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CERTIFICATE_NOT_FOUND',
          message: 'Certificate was not found.',
        },
      })
    }

    return res.json({ success: true, data: result })
  } catch (error) {
    return next(error)
  }
}

const downloadCertificate = async (req, res, next) => {
  try {
    const result = await certificateService.downloadCertificate(req.params.certificateId)
    return res.json({ success: true, data: result })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  generateCertificate,
  getCertificates,
  getCertificateById,
  downloadCertificate,
}
