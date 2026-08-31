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

  async submitRegistration(formData) {
    try {
      const response = await fetch(resolveApiUrl('/api/v1/registrations'), {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await response.json() : null

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || { code: 'UNKNOWN_ERROR', message: data?.error?.message || 'Registration failed.' },
        }
      }

      return {
        success: true,
        data: data?.data || {},
      }
    } catch (err) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: 'Unable to connect to the server. Please check your connection and try again.' },
      }
    }
  },
}
