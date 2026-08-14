const apiRoot = `${(import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''}/api`

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiRoot}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (response.status === 204) return undefined as T
  const payload = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | null
  if (!response.ok) {
    const raw = payload?.message
    const message = Array.isArray(raw) ? raw.join('. ') : raw
    throw new ApiError(message || 'Kaizen could not complete that request.', response.status)
  }
  return payload as T
}
