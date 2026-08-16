import { test, expect } from '../../support/fixtures/test'
import { env } from '../../config/env'

test.describe('Messages thread', () => {
  test('MSG04 Message CTA on peer profile opens a thread', async ({
    profilePage,
    messagesPage,
  }) => {
    const peerKey = env.peerUrlKey()
    expect(peerKey, 'E2E_PEER_URL_KEY is required for peer messaging').toBeTruthy()

    await profilePage.goto(peerKey)
    await profilePage.expectOtherProfile()
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
})
