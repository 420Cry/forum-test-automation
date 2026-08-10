import { test, expect } from '../../support/fixtures/test'
import { localePath } from '../../config/env'

test.describe.configure({ mode: 'serial' })

test.describe('App shell navigation', () => {
  test('NAV01 Header and left-rail nav render on social', async ({
    socialPage,
    appShellPage,
  }) => {
    await socialPage.goto()
    await socialPage.expectSocialLoaded()
    await appShellPage.expectShellLoaded()
    await expect(appShellPage.languageGroup()).toBeVisible()
  })

  test('NAV02 Left-rail links navigate between primary sections', async ({
    page,
    appShellPage,
    socialPage,
    findPage,
    followingPage,
    settingsHubPage,
  }) => {
    await socialPage.goto()
    await appShellPage.expectShellLoaded()

    await test.step('Find', async () => {
      await appShellPage.navLink(/find|tìm/i).click()
      await expect(page).toHaveURL(/\/find/)
      await findPage.expectLoaded()
    })

    await test.step('Following', async () => {
      await appShellPage.navLink(/following|đang theo dõi/i).click()
      await expect(page).toHaveURL(/\/following/)
      await followingPage.expectLoaded()
    })

    await test.step('Settings', async () => {
      await appShellPage.goToSettingsViaNav()
      await settingsHubPage.expectLoaded()
    })

    await test.step('Social', async () => {
      await appShellPage.navLink(/social/i).click()
      await expect(page).toHaveURL(/\/social/)
      await socialPage.expectSocialLoaded()
    })
  })

  test('NAV03 Account menu opens settings', async ({
    page,
    socialPage,
    appShellPage,
    settingsHubPage,
  }) => {
    await socialPage.goto()
    await appShellPage.goToSettingsViaMenu()
    await settingsHubPage.expectLoaded()
    await expect(page).toHaveURL(new RegExp(`${localePath('/settings')}$`))
  })

  test('NAV04 Mobile bottom nav is visible below lg', async ({
    page,
    socialPage,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await socialPage.goto()
    await socialPage.expectSocialLoaded()

    const mobileNav = page.getByRole('navigation', {
      name: /mobile|di động/i,
    })
    await expect(mobileNav).toBeVisible()
    await expect(mobileNav.getByRole('link', { name: /social/i })).toBeVisible()
    await expect(mobileNav.getByRole('link', { name: /find|tìm/i })).toBeVisible()

    await mobileNav.getByRole('link', { name: /find|tìm/i }).click()
    await expect(page).toHaveURL(/\/find/)
  })
})
