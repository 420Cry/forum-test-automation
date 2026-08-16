import { test, expect } from '../../support/fixtures/test'
import { env } from '../../config/env'

test.describe('Messages thread', () => {
  test('MSG04 Message CTA on followed peer opens a thread', async ({
    profilePage,
    messagesPage,
  }) => {
    const peerKey = env.peerUrlKey()
    expect(peerKey, 'E2E_PEER_URL_KEY is required for peer messaging').toBeTruthy()

    await profilePage.goto(peerKey)
    await profilePage.expectOtherProfile()
    // DM open is gated: follow either direction required.
    await profilePage.followPeer()
    await expect(messagesPage.profileMessageButton()).toBeVisible()

    await messagesPage.profileMessageButton().click()
    await messagesPage.expectSettled()

    const available = await messagesPage.isMessagingAvailable()
    test.skip(!available, 'Sendbird messaging unavailable in this environment')

    await messagesPage.expectThreadOpen()
  })

  test('MSG05 Send message shows bubble and delivery status', async ({
    profilePage,
    messagesPage,
  }) => {
    const peerKey = env.peerUrlKey()
    expect(peerKey, 'E2E_PEER_URL_KEY is required for peer messaging').toBeTruthy()

    await profilePage.goto(peerKey)
    await profilePage.followPeer()
    await messagesPage.profileMessageButton().click()
    await messagesPage.expectSettled()

    const available = await messagesPage.isMessagingAvailable()
    test.skip(!available, 'Sendbird messaging unavailable in this environment')

    await messagesPage.expectThreadOpen()
    const body = `e2e msg ${Date.now()}`
    await messagesPage.sendMessage(body)
    await expect(messagesPage.deliveryStatus().last()).toBeVisible({
      timeout: 15_000,
    })
  })

  test('MSG06 Desktop reaction picker toggles an emoji', async ({
    profilePage,
    messagesPage,
    page,
  }) => {
    const peerKey = env.peerUrlKey()
    expect(peerKey, 'E2E_PEER_URL_KEY is required for peer messaging').toBeTruthy()

    await profilePage.goto(peerKey)
    await profilePage.followPeer()
    await messagesPage.profileMessageButton().click()
    await messagesPage.expectSettled()

    const available = await messagesPage.isMessagingAvailable()
    test.skip(!available, 'Sendbird messaging unavailable in this environment')

    await messagesPage.expectThreadOpen()
    const body = `e2e react ${Date.now()}`
    await messagesPage.sendMessage(body)

    await messagesPage.openReactionPickerOnLastOutgoing(body)
    await messagesPage.pickReaction('👍')
    await expect(page.getByRole('button', { name: /👍/ })).toBeVisible({
      timeout: 15_000,
    })
  })

  test('MSG07 Message CTA without follow shows not-connected toast', async ({
    profilePage,
    messagesPage,
    page,
  }) => {
    const peerKey = env.peerUrlKey()
    expect(peerKey, 'E2E_PEER_URL_KEY is required for peer messaging').toBeTruthy()

    await profilePage.goto(peerKey)
    await profilePage.expectOtherProfile()
    await profilePage.unfollowPeer()

    await messagesPage.profileMessageButton().click()

    // One-way follow from peer still allows DMs — skip if channel opens.
    const opened = await page
      .waitForURL(/channelUrl=/, { timeout: 8_000 })
      .then(() => true)
      .catch(() => false)
    test.skip(
      opened,
      'Peer still follows primary (DM allowed either direction)',
    )

    await expect(messagesPage.notConnectedToast()).toBeVisible({
      timeout: 15_000,
    })
    await expect(page).not.toHaveURL(/channelUrl=/)
  })
})
