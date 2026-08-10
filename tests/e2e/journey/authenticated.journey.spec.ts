import { test, expect } from '../../support/fixtures/test'
import { env } from '../../config/env'

/**
 * End-to-end happy path across the authenticated shell.
 * Requires E2E_EMAIL / E2E_PASSWORD (auth.setup) and an onboarded user.
 */
test.describe('Authenticated journey', () => {
  test('JOUR01 Social → Find search → own profile → settings edit surface', async ({
    page,
    socialPage,
    findPage,
    profilePage,
    settingsProfilePage,
    appShellPage,
  }) => {
    await test.step('Land on social shell', async () => {
      await socialPage.goto()
      await socialPage.expectSocialLoaded()
      await appShellPage.expectShellLoaded()
    })

    await test.step('Search the directory', async () => {
      await appShellPage.navLink(/find|tìm/i).click()
      await findPage.expectLoaded()
      await findPage.search('a')
      await expect(findPage.emptyOrResults().first()).toBeVisible({
        timeout: 20_000,
      })
    })

    await test.step('Open own public profile from header', async () => {
      await appShellPage.openOwnProfileFromHeader()
      await expect(page).toHaveURL(/\/u\//)
      await profilePage.expectOwnProfile()
    })

    await test.step('Edit profile CTA opens settings editor', async () => {
      await profilePage.editProfileButton().click()
      await expect(page).toHaveURL(/\/settings\/profile/)
      await settingsProfilePage.expectLoaded()
      await settingsProfilePage.startEditing()
      await expect(settingsProfilePage.location()).toBeVisible()
      await settingsProfilePage.cancelButton().click()
    })
  })

  test('JOUR02 Follow peer from Find card when peer key is set', async ({
    findPage,
    profilePage,
    followingPage,
    page,
  }) => {
    const peerKey = env.peerUrlKey()
    expect(peerKey, 'E2E_PEER_URL_KEY is required for peer journey').toBeTruthy()

    await test.step('Open peer profile', async () => {
      await profilePage.goto(peerKey)
      await profilePage.expectOtherProfile()
    })

    await test.step('Follow from profile', async () => {
      await profilePage.followPeer()
    })

    await test.step('Peer appears on Following', async () => {
      await expect
        .poll(
          async () => {
            await followingPage.goto()
            await followingPage.expectLoaded()
            return followingPage.cards().count()
          },
          { timeout: 20_000 },
        )
        .toBeGreaterThan(0)
    })

    await test.step('Directory still loads after follow', async () => {
      await findPage.goto()
      await findPage.expectLoaded()
      await expect(page).toHaveURL(/\/find/)
    })
  })
})
