import { test as setup, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { authenticatedRoutePattern, env, hasE2EAuthCredentials } from './config/env'
import { authStoragePath } from './config/paths'
import { apiUnavailableMessage, waitForApiReady } from './support/helpers/e2eApi'
import { ensureE2EUser } from './support/helpers/ensureE2EUser'
import { LoginPage } from './support/pageObjects/LoginPage'
import { setRejectedCookieConsent } from './support/helpers/cookieConsent'

const authFile = authStoragePath

setup('authenticate', async ({ page }) => {
  if (!hasE2EAuthCredentials()) {
    throw new Error(
      'E2E credentials missing. Set E2E_EMAIL / E2E_PASSWORD or run against http://app.forum.test.',
    )
  }

  const email = env.email()
  const password = env.password()
  const apiReady = await waitForApiReady()

  if (apiReady) {
    await ensureE2EUser(email, password, { kind: 'primary' })

    const peerEmail = env.peerEmail()
    const peerPassword = env.peerPassword()
    const peerUrlKey = env.peerUrlKey()
    if (peerEmail && peerPassword) {
      await ensureE2EUser(peerEmail, peerPassword, {
        kind: 'peer',
        urlKey: peerUrlKey || undefined,
      })
    }
  }

  const login = new LoginPage(page)
  await login.login(email, password)

  await expect(page).not.toHaveURL(/\/auth\/login/)

  // Profile hydrate can briefly route via /onboard before redirecting to /social.
  try {
    await expect(page).toHaveURL(authenticatedRoutePattern(), { timeout: 20_000 })
  }
  catch {
    throw new Error(
      apiReady
        ? `E2E user stayed on ${page.url()} after login (expected social/find/…). Run forum db:migrate && forum db:seed, then re-run tests.`
        : apiUnavailableMessage(),
    )
  }

  await setRejectedCookieConsent(page)

  fs.mkdirSync(path.dirname(authFile), { recursive: true })
  await page.context().storageState({ path: authFile })
})
