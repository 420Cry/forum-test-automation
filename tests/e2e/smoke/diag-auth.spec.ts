import { test } from '@playwright/test'
import { env } from '../../config/env'
import { ensureE2EUser } from '../../support/helpers/ensureE2EUser'
import { LoginPage } from '../../support/pageObjects/LoginPage'

test('diag', async ({ page }) => {
  await ensureE2EUser(env.email(), env.password(), { kind: 'primary' })
  page.on('requestfailed', (req) => {
    if (req.url().includes('/auth/me')) {
      console.log('FAILED', req.url(), req.failure()?.errorText)
    }
  })
  page.on('response', (res) => {
    if (res.url().includes('/auth/me')) console.log('RES', res.status(), res.url())
  })
  const login = new LoginPage(page)
  await login.login(env.email(), env.password())
  await page.waitForTimeout(12000)
  console.log('URL', page.url())
})
