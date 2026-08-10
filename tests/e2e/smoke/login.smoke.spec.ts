import { test, expect } from '../../support/fixtures/test'
import { authenticatedRoutePattern, env } from '../../config/env'

test.describe('Smoke — login', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('SMK03 Signs in with valid credentials', async ({ page, loginPage }) => {
    await test.step('Submit login form', async () => {
      await loginPage.login(env.email(), env.password())
    })

    await test.step('Land on an authenticated route', async () => {
      await expect(page).not.toHaveURL(/\/auth\/login/)
      await expect(page).toHaveURL(authenticatedRoutePattern(true))
    })
  })
})
