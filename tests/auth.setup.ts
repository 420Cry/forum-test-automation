import { test as setup, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { authenticatedRoutePattern, env, hasE2EAuthCredentials } from './config/env'
import { apiUnavailableMessage, waitForApiReady } from './support/helpers/e2eApi'
import { ensureE2EUser } from './support/helpers/ensureE2EUser'
import { LoginPage } from './support/pageObjects/LoginPage'

const authFile = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../playwright/.auth/user.json',
)

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

  if (page.url().includes('/onboard')) {
    throw new Error(
      apiReady
        ? 'E2E user reached onboarding. Run forum db:migrate && forum db:seed, then re-run tests.'
        : apiUnavailableMessage(),
    )
  }

  await expect(page).toHaveURL(authenticatedRoutePattern())

  fs.mkdirSync(path.dirname(authFile), { recursive: true })
  await page.context().storageState({ path: authFile })
})
