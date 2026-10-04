export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export type ApiFetch = <T>(path: string, init?: RequestInit) => Promise<T>

// Each platform resolves its own base URL (Vite env, Expo config), so the
// client is built from it rather than reading env here.
export function createApiClient(baseUrl: string): { apiFetch: ApiFetch } {
  const base = baseUrl.replace(/\/+$/, '')
  async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      ...init
    })
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      throw new ApiError(res.status, res.statusText, text)
    }
    return res.json() as Promise<T>
  }
  return { apiFetch }
}
