import { test, expect } from '../../support/fixtures/test'
import { openPeerThread, requirePeerKey } from '../../support/flows/peerThread'

const UNAVAILABLE = 'Sendbird messaging unavailable in this environment'

test.describe('Messages thread', () => {
  // MSG04-06 follow the peer and MSG07 unfollows, so they must not race each
  // other under the project-wide `fullyParallel`. 'default' keeps them in one
  // worker without serial's cascade-skip on failure; `peerFollowLock` keeps
  // specs in other files out of the same edge.
  test.describe.configure({ mode: 'default' })

  test('MSG04 Message CTA on followed peer opens a thread', async ({
    profilePage,
    messagesPage,
    peerFollowLock: _lock,
  }) => {
    const ready = await openPeerThread(
      profilePage,
      messagesPage,
      requirePeerKey(),
    )
    test.skip(!ready, UNAVAILABLE)

    await messagesPage.expectThreadOpen()
  })

  test('MSG05 Send message shows bubble and delivery status', async ({
    profilePage,
    messagesPage,
    peerFollowLock: _lock,
  }) => {
    const ready = await openPeerThread(
      profilePage,
      messagesPage,
      requirePeerKey(),
    )
    test.skip(!ready, UNAVAILABLE)

    await messagesPage.expectThreadOpen()
    await messagesPage.sendMessage(`e2e msg ${Date.now()}`)
    await expect(messagesPage.deliveryStatus().last()).toBeVisible({
      timeout: 15_000,
    })
  })

  test('MSG06 Desktop reaction picker toggles an emoji', async ({
    profilePage,
    messagesPage,
    peerFollowLock: _lock,
  }) => {
    const ready = await openPeerThread(
      profilePage,
      messagesPage,
      requirePeerKey(),
    )
    test.skip(!ready, UNAVAILABLE)

    await messagesPage.expectThreadOpen()
    const body = `e2e react ${Date.now()}`
    await messagesPage.sendMessage(body)

    await messagesPage.reactWith(body, '👍')
    await messagesPage.expectReactionOnMessage(body, '👍')
  })

  test('MSG07 Message CTA without follow shows not-connected toast', async ({
    profilePage,
    messagesPage,
    page,
    peerFollowLock: _lock,
  }) => {
    await profilePage.goto(requirePeerKey())
    await profilePage.expectOtherProfile()
    await profilePage.unfollowPeer()

    await messagesPage.profileMessageButton().click()

    // Toast lasts ~3s — race it against navigation (do not wait for URL first).
    const result = await Promise.race([
      messagesPage
        .notConnectedToast()
        .waitFor({ state: 'visible', timeout: 10_000 })
        .then(() => 'toast' as const),
      page
        .waitForURL(/channelUrl=/, { timeout: 10_000 })
        .then(() => 'opened' as const),
    ])

    test.skip(
      result === 'opened',
      'Peer still follows primary (DM allowed either direction)',
    )

    await expect(messagesPage.notConnectedToast()).toBeVisible()
    await expect(page).not.toHaveURL(/channelUrl=/)
  })
})
