import { test as setup, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env, hasE2EAuthCredentials } from './config/env'
import { LoginPage } from './support/pageObjects/LoginPage'

const authFile = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../playwright/.auth/user.json',
)

function writeEmptyStorageState() {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })
  fs.writeFileSync(
    authFile,
    JSON.stringify({ cookies: [], origins: [] }),
    'utf8',
  )
}

setup('authenticate', async ({ page }) => {
  if (!hasE2EAuthCredentials()) {
    writeEmptyStorageState()
    setup.skip(true, 'Set E2E_EMAIL and E2E_PASSWORD in .env.local')
  }

  const login = new LoginPage(page)
  await login.login(env.email(), env.password())

  await expect(page).not.toHaveURL(/\/auth\/login/)
  await expect(page).toHaveURL(
    new RegExp(`/${env.locale}/(social|onboard|find|following|settings|u/)`),
  )

  await page.context().storageState({ path: authFile })
})
