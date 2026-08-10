import { test, expect } from '../../support/fixtures/test'
import { env } from '../../config/env'

test.describe('Follow', () => {
  test('FLW01 Following page loads', async ({ followingPage }) => {
    await followingPage.goto()
    await followingPage.expectLoaded()
  })

  test('FLW02 Follow then unfollow from peer profile', async ({
    profilePage,
    followingPage,
  }) => {
    const peerKey = env.peerUrlKey()
    test.skip(!peerKey, 'Set E2E_PEER_URL_KEY for follow flow')

    await profilePage.goto(peerKey)
    await profilePage.expectOtherProfile()

    const follow = profilePage.followButton()
    await expect(follow).toBeVisible()

    const label = (await follow.textContent())?.trim() ?? ''
    const isFollowing = /following|đang theo dõi/i.test(label)

    if (!isFollowing) {
      await follow.click()
      await expect(profilePage.followButton()).toHaveText(
        /following|đang theo dõi/i,
      )
    }

    await followingPage.goto()
    await followingPage.expectLoaded()
    await expect(followingPage.cards().first()).toBeVisible({
      timeout: 15_000,
    })

    const card = followingPage
      .cards()
      .filter({ hasText: new RegExp(peerKey, 'i') })
      .first()
    const target =
      (await card.count()) > 0 ? card : followingPage.cards().first()
    await target
      .getByRole('button', { name: /following|đang theo dõi/i })
      .click()
    await expect(target).toHaveCount(0)
  })
})
