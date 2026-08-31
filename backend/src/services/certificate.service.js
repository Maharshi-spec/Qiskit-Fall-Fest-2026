// Mock service for certificates
const certificates = new Map()

export async function generateCertificate(registrationId) {
  const certId = `CERT-${Date.now()}`
  const certificate = {
    certId,
    registrationId,
    issuedAt: new Date(),
    filePath: `/certificates/${certId}.pdf`
  }
  certificates.set(certId, certificate)
  return certificate
}

export async function getCertificate(registrationId) {
  for (const cert of certificates.values()) {
    if (cert.registrationId === registrationId) {
      return cert
    }
  }
  throw new Error('Certificate not found')
}

export async function verifyCertificate(certId) {
  const certificate = certificates.get(certId)
  if (!certificate) {
    throw new Error('Certificate not found')
  }
  return certificate
}

export async function deleteCertificate(certId) {
  if (!certificates.has(certId)) {
    throw new Error('Certificate not found')
  }
  certificates.delete(certId)
}
