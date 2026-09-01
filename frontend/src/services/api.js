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

  async loginParticipant(credentials) {
    try {
      const response = await fetch(resolveApiUrl('/api/v1/registrations/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      })

      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await response.json() : null

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || { code: 'INVALID_CREDENTIALS', message: 'Invalid email or registration ID.' },
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

  async getCurrentUser(token) {
    try {
      const response = await fetch(resolveApiUrl('/api/v1/registrations/me'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })

      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await response.json() : null

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || { code: 'UNAUTHORIZED', message: 'Session expired.' },
        }
      }

      return {
        success: true,
        data: data?.data || {},
      }
    } catch (err) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: 'Unable to connect to the server.' },
      }
    }
  },
}
