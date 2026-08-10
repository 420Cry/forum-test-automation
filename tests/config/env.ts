import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })

/** Local forum-server defaults (see `.env.example`). */
const LOCAL_DEV_DEFAULTS = {
  E2E_EMAIL: 'test@test.com',
  E2E_PASSWORD: 'test123456ABC@',
  E2E_PEER_EMAIL: 'test2@test.com',
  E2E_PEER_PASSWORD: 'test123456ABC@2',
  E2E_PEER_URL_KEY: 'test2',
  SUPABASE_URL: 'http://supabase.forum.test',
  SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  SUPABASE_SERVICE_ROLE_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  API_URL: 'http://api.forum.test',
} as const

type DevDefaultKey = keyof typeof LOCAL_DEV_DEFAULTS

function isLocalForumTest(): boolean {
  const base = (process.env.BASE_URL ?? 'http://app.forum.test').trim()
  return base.includes('forum.test') || base.includes('localhost')
}

function resolveEnv(name: DevDefaultKey | 'E2E_EMAIL' | 'E2E_PASSWORD'): string {
  const trimmed = process.env[name]?.trim()
  if (trimmed) return trimmed
  if (isLocalForumTest() && name in LOCAL_DEV_DEFAULTS) {
    return LOCAL_DEV_DEFAULTS[name as DevDefaultKey]
  }
  return ''
}

function required(name: 'E2E_EMAIL' | 'E2E_PASSWORD'): string {
  const value = resolveEnv(name)
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example → .env.local or run against http://app.forum.test with local defaults.`,
    )
  }
  return value
}

export function hasE2EAuthCredentials(): boolean {
  return Boolean(resolveEnv('E2E_EMAIL') && resolveEnv('E2E_PASSWORD'))
}

export const env = {
  baseURL: process.env.BASE_URL ?? 'http://app.forum.test',
  locale: (process.env.LOCALE ?? 'en') as 'en' | 'vn',
  email: () => required('E2E_EMAIL'),
  password: () => required('E2E_PASSWORD'),
  peerEmail: () => resolveEnv('E2E_PEER_EMAIL'),
  peerPassword: () => resolveEnv('E2E_PEER_PASSWORD'),
  peerUrlKey: () => resolveEnv('E2E_PEER_URL_KEY'),
  supabaseUrl: () => resolveEnv('SUPABASE_URL'),
  supabaseAnonKey: () => resolveEnv('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: () => resolveEnv('SUPABASE_SERVICE_ROLE_KEY'),
  apiUrl: () => resolveEnv('API_URL'),
}

export function localePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `/${env.locale}${normalized}`
}
