const fs = require('fs/promises')
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')
const {
  CERTIFICATE_TYPES,
  buildCertificateMeta,
  ensureTemplatePath,
  getCertificateTypeConfig,
  normalizeIssueDate,
  resolveTemplateSettings,
} = require('./certificate.utils')

const loadTemplatePdf = async (templatePath) => {
  const resolvedTemplatePath = ensureTemplatePath(templatePath)
  const templateBytes = await fs.readFile(resolvedTemplatePath)

  return {
    templatePath: resolvedTemplatePath,
    templateBytes,
  }
}

const preparePdfForDynamicText = async ({
  pdfDocument,
  certificateType,
  participantName,
  certificateId,
  registrationId,
  issueDate,
  templateConfig = {},
}) => {
  const templateMeta = buildCertificateMeta({
    participantName,
    certificateId,
    registrationId,
    issueDate,
    certificateType,
  })

  const typeConfig = getCertificateTypeConfig(templateMeta.certificateType)
  const resolvedSettings = resolveTemplateSettings({
    certificateType: templateMeta.certificateType,
    templateConfig,
  })

  const page = pdfDocument.getPages()[0]
  const { width, height } = page.getSize()
  const font = await pdfDocument.embedFont(StandardFonts.Helvetica)

  return {
    page,
    width,
    height,
    font,
    templateConfig: typeConfig,
    settings: resolvedSettings,
    metadata: templateMeta,
  }
}

const generateCertificate = async ({
  templatePath,
  participantName,
  certificateId,
  registrationId,
  issueDate,
  certificateType = CERTIFICATE_TYPES.EVENT_PARTICIPANT,
  templateConfig = {},
} = {}) => {
  if (!templatePath) {
    throw new Error('templatePath is required to generate a certificate')
  }

  const { templateBytes, templatePath: resolvedTemplatePath } = await loadTemplatePdf(templatePath)
  const pdfDocument = await PDFDocument.load(templateBytes)

  const preparedDocument = await preparePdfForDynamicText({
    pdfDocument,
    certificateType,
    participantName,
    certificateId,
    registrationId,
    issueDate,
    templateConfig,
  })

  const { page, width, height, font, settings, metadata } = preparedDocument

  const safeParticipantX = width * 0.12
  const safeTopY = height * 0.74
  const detailY = height * 0.58

  page.drawText(metadata.participantName, {
    x: safeParticipantX,
    y: safeTopY,
    size: settings.fontSize,
    font,
    color: rgb(...settings.textColor),
    maxWidth: width * 0.76,
  })

  page.drawText(`Certificate ID: ${metadata.certificateId}`, {
    x: safeParticipantX,
    y: detailY,
    size: settings.mutedFontSize,
    font,
    color: rgb(...settings.textColor),
  })

  page.drawText(`Registration ID: ${metadata.registrationId}`, {
    x: safeParticipantX,
    y: detailY - 18,
    size: settings.mutedFontSize,
    font,
    color: rgb(...settings.textColor),
  })

  page.drawText(`Issued: ${normalizeIssueDate(metadata.issueDate)}`, {
    x: safeParticipantX,
    y: detailY - 36,
    size: settings.mutedFontSize,
    font,
    color: rgb(...settings.textColor),
  })

  const pdfBytes = await pdfDocument.save()

  return {
    certificateType: metadata.certificateType,
    templatePath: resolvedTemplatePath,
    fileName: `${metadata.certificateId}.pdf`,
    buffer: Buffer.from(pdfBytes),
    pdfBytes,
    metadata,
    layout: settings.layout,
  }
}

module.exports = {
  generateCertificate,
  loadTemplatePdf,
  preparePdfForDynamicText,
  CERTIFICATE_TYPES,
}
