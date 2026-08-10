import { test, expect } from '../../support/fixtures/test'
import { env, localePath } from '../../config/env'

test.describe('Own profile', () => {
  test('PROF01 Avatar opens own public profile view', async ({
    page,
    profilePage,
  }) => {
    await page.goto(localePath('/find'))

    await page
      .getByRole('button', { name: /view your profile|xem hồ sơ của bạn/i })
      .click()

    await expect(page).toHaveURL(/\/u\//)
    await profilePage.expectOwnProfile()
  })

  test('PROF02 Edit profile CTA goes to settings', async ({
    page,
    profilePage,
  }) => {
    await page.goto(localePath('/find'))
    await page
      .getByRole('button', { name: /view your profile|xem hồ sơ của bạn/i })
      .click()
    await profilePage.expectOwnProfile()

    await profilePage.editProfileButton().click()
    await expect(page).toHaveURL(/\/settings\/profile/)
  })
})

test.describe('Peer profile', () => {
  test('PROF03 Can open another user profile when peer url-key is set', async ({
    profilePage,
  }) => {
    const peerKey = env.peerUrlKey()
    test.skip(!peerKey, 'Set E2E_PEER_URL_KEY to exercise other-profile flow')

    await profilePage.goto(peerKey)
    await profilePage.expectOtherProfile()
  })
})
