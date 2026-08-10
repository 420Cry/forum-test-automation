import { env } from '../../config/env'

type Headers = Record<string, string>

export function apiHeaders(token: string, serviceRole = false): Headers {
  const headers: Headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  if (serviceRole) headers.apikey = token
  return headers
}

export async function isApiReady(): Promise<boolean> {
  try {
    const res = await fetch(`${env.apiUrl()}/health`, {
      signal: AbortSignal.timeout(5_000),
    })
    return res.ok
  }
  catch {
    return false
  }
}

/** Poll `/health` until the API responds or timeout. Returns false if still down. */
export async function waitForApiReady(
  { timeoutMs = 30_000, intervalMs = 1_000 } = {},
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await isApiReady()) return true
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  return false
}

export function apiUnavailableMessage(detail?: string): string {
  const base
    = `Forum API is not reachable at ${env.apiUrl()} (nginx 502 usually means forum-api failed to start).`
  const fixes
    = 'Fix: docker logs forum-api — if a missing module, run `docker exec forum-api bun install` or `forum dev --build`.'
  return detail ? `${base} ${detail} ${fixes}` : `${base} ${fixes}`
}

export async function signIn(
  email: string,
  password: string,
): Promise<string | null> {
  const res = await fetch(
    `${env.supabaseUrl()}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: apiHeaders(env.supabaseAnonKey(), true),
      body: JSON.stringify({ email, password }),
    },
  )
  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string }
  return data.access_token ?? null
}

export async function fetchMe(token: string) {
  const res = await fetch(`${env.apiUrl()}/auth/me`, {
    headers: apiHeaders(token),
  })
  if (!res.ok) return null
  return res.json() as Promise<{ profile?: { onboarded?: boolean } }>
}

export async function createConfirmedUser(
  email: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${env.supabaseUrl()}/auth/v1/admin/users`, {
    method: 'POST',
    headers: apiHeaders(env.supabaseServiceRoleKey(), true),
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
  if (res.ok) return

  const body = await res.text()
  if (res.status === 422 && body.includes('already')) return

  throw new Error(
    `Failed to ensure e2e user ${email} (${res.status}): ${body.slice(0, 200)}`,
  )
}

export async function apiPost(
  token: string,
  path: string,
  body: unknown,
): Promise<Response> {
  return fetch(`${env.apiUrl()}${path}`, {
    method: 'POST',
    headers: apiHeaders(token),
    body: JSON.stringify(body),
  })
}

export async function apiPatch(
  token: string,
  path: string,
  body: Record<string, unknown>,
): Promise<Response> {
  return fetch(`${env.apiUrl()}${path}`, {
    method: 'PATCH',
    headers: apiHeaders(token),
    body: JSON.stringify(body),
  })
}
