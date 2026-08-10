import { test as setup, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env, hasE2EAuthCredentials } from './config/env'
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

  const login = new LoginPage(page)
  await login.login(email, password)

  await expect(page).not.toHaveURL(/\/auth\/login/)
  await expect(page).toHaveURL(
    new RegExp(`/${env.locale}/(social|find|following|settings|u/)`),
  )

  fs.mkdirSync(path.dirname(authFile), { recursive: true })
  await page.context().storageState({ path: authFile })
})
