import { test, expect } from '../../support/fixtures/test'
import { env } from '../../config/env'

test.describe('Own profile', () => {
  test('PROF01 Avatar opens own public profile view', async ({
    page,
    profilePage,
    appShellPage,
  }) => {
    await appShellPage.goto()
    await appShellPage.openOwnProfileFromHeader()
    await expect(page).toHaveURL(/\/u\//)
    await profilePage.expectOwnProfile()
  })

  test('PROF02 Edit profile CTA goes to settings', async ({
    page,
    profilePage,
    appShellPage,
  }) => {
    await appShellPage.goto()
    await appShellPage.openOwnProfileFromHeader()
    await profilePage.expectOwnProfile()

    await profilePage.editProfileButton().click()
    await expect(page).toHaveURL(/\/settings\/profile/)
  })

  test('PROF04 Followers opens list sheet', async ({
    profilePage,
    appShellPage,
  }) => {
    await appShellPage.goto()
    await appShellPage.openOwnProfileFromHeader()
    await profilePage.expectOwnProfile()
    await profilePage.openFollowersSheet()
  })

  test('PROF05 Following opens list sheet', async ({
    profilePage,
    appShellPage,
  }) => {
    await appShellPage.goto()
    await appShellPage.openOwnProfileFromHeader()
    await profilePage.expectOwnProfile()
    await profilePage.openFollowingSheet()
  })
})

test.describe('Peer profile', () => {
  test('PROF03 Can open another user profile when peer url-key is set', async ({
    profilePage,
  }) => {
    const peerKey = env.peerUrlKey()
    expect(peerKey, 'E2E_PEER_URL_KEY is required for peer profile flow').toBeTruthy()

    await profilePage.goto(peerKey)
    await profilePage.expectOtherProfile()
  })

  test('PROF06 Follow peer bumps own following count', async ({
    profilePage,
    appShellPage,
  }) => {
    const peerKey = env.peerUrlKey()
    expect(peerKey, 'E2E_PEER_URL_KEY is required for peer profile flow').toBeTruthy()

    await appShellPage.goto()
    await appShellPage.openOwnProfileFromHeader()
    await profilePage.expectOwnProfile()
    const before = await profilePage.followingCount()
    expect(before).toBeGreaterThanOrEqual(0)

    await profilePage.goto(peerKey)
    await profilePage.expectOtherProfile()
    await expect(profilePage.followButton()).toBeEnabled({ timeout: 15_000 })
    const followLabel = (await profilePage.followButton().textContent())?.trim() ?? ''
    const alreadyFollowing = /following|đang theo dõi/i.test(followLabel)
    if (!alreadyFollowing) {
      await profilePage.followPeer()
    }

    await appShellPage.openOwnProfileFromHeader()
    await profilePage.expectOwnProfile()
    const expected = alreadyFollowing ? before : before + 1
    // Public profile counts can lag briefly after follow; poll until settled.
    await expect
      .poll(async () => profilePage.followingCount(), { timeout: 15_000 })
      .toBe(expected)
  })
})
