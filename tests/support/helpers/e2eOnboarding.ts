import {
  apiPatch,
  apiPost,
  apiUnavailableMessage,
  createConfirmedUser,
  fetchMe,
  signIn,
} from './e2eApi'
import { retryUntil } from './retry'
import { env } from '../../config/env'

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

const SHARED = {
  firstName: 'Test',
  dateOfBirth: '1990-01-15',
  location: 'austin-us',
  locationName: 'Austin',
  occupation: 'founder',
  occupationName: 'Founder',
} as const

const ONBOARDING = {
  primary: {
    ...SHARED,
    role: 'Founder',
    goals: ['raise_capital', 'find_cofounders'],
    lastName: 'User',
  },
  peer: {
    ...SHARED,
    role: 'Investor',
    goals: ['network_peers', 'discover_startups'],
    lastName: 'Peer',
    dateOfBirth: '1995-06-15',
  },
} as const satisfies Record<'primary' | 'peer', OnboardingBody>

export type EnsureE2EUserOptions = {
  kind?: 'primary' | 'peer'
  urlKey?: string
}

async function completeOnboarding(
  token: string,
  body: OnboardingBody,
): Promise<void> {
  const ok = await retryUntil(async () => {
    const res = await apiPost(token, '/user/onboarding', body)
    if (res.ok) return true

    const text = await res.text()
    if (res.status === 400 && text.toLowerCase().includes('already completed')) {
      return true
    }

    if (res.status === 502 || res.status === 503) return false

    if (res.status >= 500) {
      throw new Error(
        `POST /user/onboarding failed (${res.status}). Run forum db:migrate if the API schema is behind. ${text.slice(0, 200)}`,
      )
    }

    throw new Error(
      `POST /user/onboarding failed (${res.status}): ${text.slice(0, 300)}`,
    )
  }, { attempts: 15, delayMs: 2_000 })

  if (!ok) {
    throw new Error(
      'POST /user/onboarding timed out (502/503). '
      + apiUnavailableMessage('The API may still be compiling or missing node_modules in Docker.'),
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
  let token = await signIn(email, password)
  if (!token) {
    await createConfirmedUser(email, password)
    token = await signIn(email, password)
  }
  if (!token) {
    throw new Error(`E2E user ${email} still cannot sign in after provisioning`)
  }

  const me = await fetchMe(token)
  const kind = resolveKind(email, options)

  if (!me?.profile?.onboarded) {
    await completeOnboarding(token, ONBOARDING[kind])
  }

  const desiredUrlKey
    = options.urlKey ?? (kind === 'peer' ? env.peerUrlKey() : undefined)
  if (desiredUrlKey) {
    const res = await apiPatch(token, '/user/profile', { urlKey: desiredUrlKey })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(
        `PATCH /user/profile failed (${res.status}): ${text.slice(0, 300)}`,
      )
    }
  }
}
