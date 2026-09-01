const { pool } = require('../config/database')
const { AppError } = require('../middleware/error.middleware')
const {
  CERTIFICATE_TYPES,
  CERTIFICATE_STORAGE_CONFIG,
  buildCertificateDbRecord,
  ensureCertificateType,
  getCertificateTypeConfig,
  resolveCertificateTemplate,
  buildCertificateMeta,
} = require('../utils/certificate.utils')

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '')

const getCertificateTemplateForType = (certificateType) => {
  const type = ensureCertificateType(certificateType)
  const templateConfig = getCertificateTypeConfig(type)

  return {
    certificateType: type,
    templateName: templateConfig.templateName,
    templatePath: templateConfig.storagePath || null,
    bucketName: CERTIFICATE_STORAGE_CONFIG.bucketName,
    folderPath: CERTIFICATE_STORAGE_CONFIG.directories.templates,
  }
}

const buildCertificateNumber = ({ registrationId, certificateType }) => {
  const type = ensureCertificateType(certificateType)
  const safeId = String(registrationId).trim()

  if (!safeId) {
    throw new AppError(400, 'INVALID_REGISTRATION_ID', 'registrationId is required for certificate number generation.')
  }

  return `CERT-${type}-${safeId}`
}

const findRegistrationById = async (registrationId) => {
  const result = await pool.query('SELECT * FROM registrations WHERE id = $1 LIMIT 1', [registrationId])
  return result.rows[0] || null
}

const findRegistrationByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return null
  }

  const result = await pool.query('SELECT * FROM registrations WHERE email = $1 LIMIT 1', [normalizedEmail])
  return result.rows[0] || null
}

const prepareCertificateGenerationContext = async ({ registrationId, certificateType, participantName, participantEmail }) => {
  const type = ensureCertificateType(certificateType)
  const registration = await findRegistrationById(registrationId)

  if (!registration) {
    throw new AppError(404, 'REGISTRATION_NOT_FOUND', 'Registration not found for certificate generation.')
  }

  const resolvedParticipantName = participantName || registration.full_name || registration.fullName || 'Participant'
  const resolvedParticipantEmail = participantEmail || registration.email

  const templateInfo = resolveCertificateTemplate(type)
  const templateReference = templateInfo.storagePath || null

  if (!templateReference || String(templateReference).includes('TODO')) {
    throw new AppError(
      503,
      'CERTIFICATE_TEMPLATE_UNAVAILABLE',
      `Certificate template for ${type} is not available yet. Upload the final template before generating certificates.`,
    )
  }

  const certificateNumber = buildCertificateNumber({ registrationId, certificateType: type })

  return {
    registration,
    certificateType: type,
    participantName: resolvedParticipantName,
    participantEmail: resolvedParticipantEmail,
    certificateNumber,
    template: templateInfo,
    metadata: buildCertificateMeta({
      participantName: resolvedParticipantName,
      certificateId: certificateNumber,
      registrationId: String(registrationId),
      issueDate: new Date(),
      certificateType: type,
    }),
  }
}

const listCertificates = async () => {
  const result = await pool.query(
    `SELECT id, certificate_number, registration_id, certificate_type, participant_name, participant_email,
      issued_at, file_path, status, created_at
     FROM certificates ORDER BY created_at DESC`,
  )

  return result.rows
}

const getCertificateById = async (certificateId) => {
  const result = await pool.query(
    `SELECT id, certificate_number, registration_id, certificate_type, participant_name, participant_email,
      issued_at, file_path, status, created_at
     FROM certificates WHERE id = $1 LIMIT 1`,
    [certificateId],
  )

  return result.rows[0] || null
}

const getCertificateByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return []
  }

  const result = await pool.query(
    `SELECT id, certificate_number, registration_id, certificate_type, participant_name, participant_email,
      issued_at, file_path, status, created_at
     FROM certificates WHERE participant_email = $1 ORDER BY created_at DESC`,
    [normalizedEmail],
  )

  return result.rows
}

const createCertificateRecord = async ({
  registrationId,
  certificateType,
  participantName,
  participantEmail,
  certificateNumber,
  filePath = null,
  status = 'issued',
}) => {
  const type = ensureCertificateType(certificateType)
  const certificateRecord = buildCertificateDbRecord({
    registrationId,
    certificateType: type,
    participantName,
    participantEmail,
    certificateNumber,
    filePath,
    status,
  })

  return certificateRecord
}

const generateCertificate = async (payload = {}) => {
  const { registrationId, certificateType, participantName, participantEmail } = payload

  if (!registrationId) {
    throw new AppError(400, 'INVALID_REQUEST', 'registrationId is required.')
  }

  const context = await prepareCertificateGenerationContext({
    registrationId,
    certificateType,
    participantName,
    participantEmail,
  })

  const record = await createCertificateRecord({
    registrationId,
    certificateType: context.certificateType,
    participantName: context.participantName,
    participantEmail: context.participantEmail,
    certificateNumber: context.certificateNumber,
    filePath: null,
    status: 'issued',
  })

  return {
    success: false,
    error: {
      code: 'CERTIFICATE_TEMPLATE_UNAVAILABLE',
      message: `Certificate template for ${context.certificateType} is not available yet. Upload the final template before generating certificates.`,
    },
    preparedRecord: record,
  }
}

const downloadCertificate = async (certificateId) => {
  const certificate = await getCertificateById(certificateId)

  if (!certificate) {
    throw new AppError(404, 'CERTIFICATE_NOT_FOUND', 'Certificate was not found.')
  }

  if (!certificate.file_path) {
    throw new AppError(404, 'CERTIFICATE_FILE_NOT_FOUND', 'Generated certificate file is not available yet.')
  }

  return {
    certificateId: certificate.id,
    certificateNumber: certificate.certificate_number,
    status: certificate.status,
    filePath: certificate.file_path,
  }
}

module.exports = {
  getCertificateTemplateForType,
  buildCertificateNumber,
  findRegistrationById,
  findRegistrationByEmail,
  prepareCertificateGenerationContext,
  listCertificates,
  getCertificateById,
  getCertificateByEmail,
  createCertificateRecord,
  generateCertificate,
  downloadCertificate,
}
