import { test, expect } from '../../support/fixtures/test'
import { localePath } from '../../config/env'

test.describe('Smoke — guest', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('SMK01 Login page renders email and password fields', async ({
    loginPage,
  }) => {
    await loginPage.goto()
    await loginPage.expectLoaded()
    await expect(loginPage.email()).toBeEditable()
    await expect(loginPage.password()).toBeEditable()
  })

  test('SMK02 Protected find redirects guests to login', async ({ page }) => {
    await page.goto(localePath('/find'), { waitUntil: 'domcontentloaded' })
    const gateway = page.getByRole('heading', {
      name: /502 Bad Gateway|503 Service|504 Gateway/i,
    })
    if ((await gateway.count()) > 0) {
      throw new Error(
        `App unreachable at ${page.url()}. Start the stack with: forum dev`,
      )
    }
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
