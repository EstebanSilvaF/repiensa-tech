import { API_URL, TOKEN_KEY } from '../config/env'

interface RequestOptions {
  body?: unknown
  headers?: Record<string, string>
  params?: Record<string, string | boolean | undefined>
  auth?: boolean
}

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler
}

function buildUrl(path: string, params?: RequestOptions['params']) {
  if (!params) return path

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  }

  const query = searchParams.toString()
  return query ? `${path}?${query}` : path
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, params, body, headers: extraHeaders } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  }

  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_URL}${buildUrl(path, params)}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    if (response.status === 401 && onUnauthorized) {
      onUnauthorized()
    }

    let message = `Request failed with status ${response.status}`
    try {
      const errorBody = await response.json()
      if (typeof errorBody.message === 'string') {
        message = errorBody.message
      } else if (typeof errorBody.error === 'string') {
        message = errorBody.error
      }
    } catch {
      // use default message
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, options),
  post: <T>(path: string, options?: RequestOptions) =>
    request<T>('POST', path, options),
  patch: <T>(path: string, options?: RequestOptions) =>
    request<T>('PATCH', path, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, options),
}

export { ApiError }
