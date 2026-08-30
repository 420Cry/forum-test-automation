import { test, expect } from '../../support/fixtures/test'
import { localePath } from '../../config/env'

test.describe('Smoke — cookies', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('SMK09 Cookie banner is visible on login and Accept all hides it', async ({
    page,
    loginPage,
    cookieBannerPage,
  }) => {
    await loginPage.goto()
    await loginPage.expectLoaded()
    await cookieBannerPage.expectVisible()

    await cookieBannerPage.waitForAppHydrated()
    await cookieBannerPage.acceptAll().click()
    await expect
      .poll(async () =>
        (await page.context().cookies()).some(
          cookie => cookie.name === 'forum_cookie_consent',
        ),
      )
      .toBe(true)
    await cookieBannerPage.expectHidden()
  })

  test('SMK10 Cookie policy page is public and opens preferences', async ({
    page,
    cookieBannerPage,
  }) => {
    await cookieBannerPage.gotoPolicy()
    await expect(
      page.getByRole('heading', {
        name: /cookie policy|chính sách cookie/i,
      }).first(),
    ).toBeVisible()
    await expect(page.getByText('forum_locale')).toBeVisible()
    await expect(page.getByText('forum_cookie_consent')).toBeVisible()

    await expect(cookieBannerPage.cookieSettingsInMain()).toBeEnabled()
    await cookieBannerPage.cookieSettingsInMain().click()
    await expect(cookieBannerPage.preferencesDialog()).toBeVisible()
    await expect(
      cookieBannerPage.preferencesDialog().getByRole('switch', {
        name: /performance cookies|cookie hiệu suất/i,
      }),
    ).toBeEnabled()
  })

  test('SMK11 Privacy and terms pages are public', async ({ page }) => {
    await page.goto(localePath('/legal/privacy'), {
      waitUntil: 'domcontentloaded',
    })
    await expect(
      page.getByRole('heading', {
        name: /privacy policy|chính sách bảo mật/i,
      }).first(),
    ).toBeVisible()

    await page.goto(localePath('/legal/terms'), {
      waitUntil: 'domcontentloaded',
    })
    await expect(
      page.getByRole('heading', {
        name: /terms of use|điều khoản sử dụng/i,
      }).first(),
    ).toBeVisible()
  })
})
