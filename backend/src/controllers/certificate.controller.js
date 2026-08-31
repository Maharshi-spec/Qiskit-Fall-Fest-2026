import * as certificateService from '../services/certificate.service.js'

export async function generateCertificate(req, res, next) {
  try {
    const certificate = await certificateService.generateCertificate(req.params.registrationId)
    res.json({
      success: true,
      data: certificate
    })
  } catch (error) {
    next(error)
  }
}

export async function downloadCertificate(req, res, next) {
  try {
    const certificate = await certificateService.getCertificate(req.params.registrationId)
    res.download(certificate.filePath, `certificate-${req.params.registrationId}.pdf`)
  } catch (error) {
    next(error)
  }
}

export async function verifyCertificate(req, res, next) {
  try {
    const certificate = await certificateService.verifyCertificate(req.params.certId)
    res.json({
      success: true,
      verified: certificate ? true : false,
      data: certificate
    })
  } catch (error) {
    next(error)
  }
}
