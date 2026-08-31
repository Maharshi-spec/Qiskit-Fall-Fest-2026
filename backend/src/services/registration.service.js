// Mock service for registrations
const registrations = new Map()

export async function createRegistration(data) {
  const id = Date.now().toString()
  const registration = {
    id,
    ...data,
    createdAt: new Date()
  }
  registrations.set(id, registration)
  return registration
}

export async function getRegistration(id) {
  const registration = registrations.get(id)
  if (!registration) {
    throw new Error('Registration not found')
  }
  return registration
}

export async function getAllRegistrations() {
  return Array.from(registrations.values())
}

export async function updateRegistration(id, data) {
  const registration = registrations.get(id)
  if (!registration) {
    throw new Error('Registration not found')
  }
  const updated = { ...registration, ...data, updatedAt: new Date() }
  registrations.set(id, updated)
  return updated
}

export async function deleteRegistration(id) {
  if (!registrations.has(id)) {
    throw new Error('Registration not found')
  }
  registrations.delete(id)
}
