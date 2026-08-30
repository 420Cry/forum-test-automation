import type { Page } from '@playwright/test'
import { env } from '../../config/env'

export const COOKIE_CONSENT_COOKIE = 'forum_cookie_consent'

const rejectedConsent = {
  v: 1,
  necessary: true,
  performance: false,
  functional: false,
  targeting: false,
}

export async function setRejectedCookieConsent(page: Page) {
  const base = env.baseURL.endsWith('/') ? env.baseURL : `${env.baseURL}/`
  await page.context().addCookies([
    {
      name: COOKIE_CONSENT_COOKIE,
      value: encodeURIComponent(JSON.stringify(rejectedConsent)),
      url: base,
      path: '/',
      sameSite: 'Lax',
    },
  ])
}
