import { test, expect } from '../../support/fixtures/test'
import { localePath } from '../../config/env'

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
      await appShellPage.navLink(/settings|cài đặt/i).click()
      await expect(page).toHaveURL(/\/settings/)
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
})
