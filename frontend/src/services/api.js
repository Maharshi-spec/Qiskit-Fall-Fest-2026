const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const resolveApiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (!API_BASE_URL) {
    return normalizedPath
  }

  return `${API_BASE_URL}${normalizedPath}`
}

export const api = {
  baseUrl: API_BASE_URL,
  getUrl: resolveApiUrl,
  registrationUrl: () => resolveApiUrl('/api/v1/registrations'),
  submitRegistration: async (formData) => {
    const response = await fetch(api.registrationUrl(), {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? await response.json() : null

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Registration failed.')
    }

    return data
  },
}
