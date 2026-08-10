import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example → .env.local and fill credentials.`,
    )
  }
  return value
}

export function hasE2EAuthCredentials(): boolean {
  return Boolean(
    process.env.E2E_EMAIL?.trim() && process.env.E2E_PASSWORD?.trim(),
  )
}

export const env = {
  baseURL: process.env.BASE_URL ?? 'http://app.forum.test',
  locale: (process.env.LOCALE ?? 'en') as 'en' | 'vn',
  email: () => required('E2E_EMAIL'),
  password: () => required('E2E_PASSWORD'),
  peerEmail: () => process.env.E2E_PEER_EMAIL?.trim() || '',
  peerPassword: () => process.env.E2E_PEER_PASSWORD?.trim() || '',
  peerUrlKey: () => process.env.E2E_PEER_URL_KEY?.trim() || '',
}

export function localePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `/${env.locale}${normalized}`
}
