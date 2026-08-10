import { env } from '../../config/env'

type AuthHeaders = Record<string, string>

type OnboardingBody = {
  role: 'Founder' | 'Investor'
  goals: string[]
  firstName: string
  lastName: string
  dateOfBirth: string
  location: string
  locationName?: string
  occupation: string
  occupationName?: string
}


const ONBOARDING = {
  primary: {
    role: 'Founder',
    goals: ['raise_capital', 'find_cofounders'],
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: '1990-01-15',
    location: 'austin-us',
    locationName: 'Austin',
    occupation: 'founder',
    occupationName: 'Founder',
  },
  peer: {
    role: 'Investor',
    goals: ['network_peers', 'discover_startups'],
    firstName: 'Test',
    lastName: 'Peer',
    dateOfBirth: '1995-06-15',
    location: 'austin-us',
    locationName: 'Austin',
    occupation: 'founder',
    occupationName: 'Founder',
  },
} as const satisfies Record<'primary' | 'peer', OnboardingBody>

export type EnsureE2EUserOptions = {
  kind?: 'primary' | 'peer'
  urlKey?: string
}

function authHeaders(key: string): AuthHeaders {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

function bearerHeaders(token: string): AuthHeaders {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

async function canSignIn(email: string, password: string): Promise<boolean> {
  return (await signIn(email, password)) !== null
}

async function signIn(
  email: string,
  password: string,
): Promise<string | null> {
  const res = await fetch(
    `${env.supabaseUrl()}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: authHeaders(env.supabaseAnonKey()),
      body: JSON.stringify({ email, password }),
    },
  )
  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string }
  return data.access_token ?? null
}

async function createConfirmedUser(
  email: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${env.supabaseUrl()}/auth/v1/admin/users`, {
    method: 'POST',
    headers: authHeaders(env.supabaseServiceRoleKey()),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
    }),
  })
  if (res.ok) return

  const body = await res.text()
  if (res.status === 422 && body.includes('already')) return

  throw new Error(
    `Failed to ensure e2e user ${email} (${res.status}): ${body.slice(0, 200)}`,
  )
}


async function completeOnboarding(
  token: string,
  body: OnboardingBody,
): Promise<void> {
  const res = await fetch(`${env.apiUrl()}/user/onboarding`, {
    method: 'POST',
    headers: bearerHeaders(token),
    body: JSON.stringify(body),
  })
  if (res.ok) return

  const text = await res.text()
  if (res.status === 400 && text.toLowerCase().includes('already completed')) {
    return
  }

  if (res.status >= 500) {
    throw new Error(
      `POST /user/onboarding failed (${res.status}). Run forum db:migrate if the API schema is behind. ${text.slice(0, 200)}`,
    )
  }

  throw new Error(
    `POST /user/onboarding failed (${res.status}): ${text.slice(0, 300)}`,
  )
}

async function patchProfile(
  token: string,
  body: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${env.apiUrl()}/user/profile`, {
    method: 'PATCH',
    headers: bearerHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `PATCH /user/profile failed (${res.status}): ${text.slice(0, 300)}`,
    )
  }
}

function resolveKind(
  email: string,
  options: EnsureE2EUserOptions,
): 'primary' | 'peer' {
  if (options.kind) return options.kind
  return email === env.peerEmail() ? 'peer' : 'primary'
}

/** Idempotent: auth user exists, is onboarded, and optional url key is set. */
export async function ensureE2EUser(
  email: string,
  password: string,
  options: EnsureE2EUserOptions = {},
): Promise<void> {
  if (!(await canSignIn(email, password))) {
    await createConfirmedUser(email, password)
  }

  const token = await signIn(email, password)
  if (!token) {
    throw new Error(`E2E user ${email} still cannot sign in after provisioning`)
  }

  const kind = resolveKind(email, options)
  await completeOnboarding(token, ONBOARDING[kind])

  const desiredUrlKey
    = options.urlKey ?? (kind === 'peer' ? env.peerUrlKey() : undefined)
  if (desiredUrlKey) {
    await patchProfile(token, { urlKey: desiredUrlKey })
  }
}
