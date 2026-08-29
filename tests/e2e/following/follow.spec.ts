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
    peerFollowLock: _lock,
  }) => {
    const peerKey = env.peerUrlKey()
    expect(peerKey, 'E2E_PEER_URL_KEY is required for follow flow').toBeTruthy()

    await profilePage.goto(peerKey)
    await profilePage.expectOtherProfile()
    await profilePage.followPeer()

    await followingPage.goto()
    await followingPage.expectLoaded()
    await expect
      .poll(async () => followingPage.cards().count(), { timeout: 15_000 })
      .toBeGreaterThan(0)

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

  test('FLW03 Following cards do not show raw city keys', async ({
    followingPage,
    profilePage,
    peerFollowLock: _lock,
  }) => {
    const peerKey = env.peerUrlKey()
    expect(peerKey, 'E2E_PEER_URL_KEY is required for follow flow').toBeTruthy()

    await profilePage.goto(peerKey)
    await profilePage.expectOtherProfile()
    await profilePage.followPeer()

    await followingPage.goto()
    await followingPage.expectLoaded()
    await expect
      .poll(async () => followingPage.cards().count(), { timeout: 15_000 })
      .toBeGreaterThan(0)

    const text = await followingPage.cards().first().innerText()
    expect(text).not.toMatch(/city_[a-z0-9_]+/i)
  })
})
